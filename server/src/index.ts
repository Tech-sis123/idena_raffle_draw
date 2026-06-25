import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import { stringify } from 'csv-stringify/sync';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const ADMIN_KEY = process.env.ADMIN_KEY;

// Utility: Generate #XXXX padded number
const generateRaffleNumber = async (): Promise<string> => {
  while (true) {
    const num = Math.floor(Math.random() * 10000);
    const paddedNum = `#${num.toString().padStart(4, '0')}`;
    // Check if exists
    const exists = await prisma.participant.findUnique({
      where: { number: paddedNum },
    });
    if (!exists) {
      return paddedNum;
    }
  }
};

// 1. Register Participant
app.post('/api/raffle/register', async (req, res) => {
  try {
    let { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    // Basic sanitization
    name = name.trim().slice(0, 100);
    email = email.trim().toLowerCase().slice(0, 100);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    // Check if participant already exists
    const existing = await prisma.participant.findUnique({
      where: { email },
    });

    if (existing) {
      return res.status(200).json({ 
        message: `You already have a raffle number: ${existing.number}`,
        number: existing.number,
        isExisting: true
      });
    }

    // Generate unique number
    const number = await generateRaffleNumber();

    // Save to DB
    const participant = await prisma.participant.create({
      data: { name, email, number },
    });

    // Send Confirmation Email
    if (process.env.RESEND_API_KEY) {
      try {
        const { error: emailError } = await resend.emails.send({
          from: '"IDENA Giveaway" <onboarding@resend.dev>', 
          to: email, // Note: Until you verify a domain in Resend, you can only send emails to the email address you used to create your Resend account!
          subject: 'Your IDENA Raffle Number',
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #e33286;">Welcome to the IDENA Giveaway! 🎉</h2>
              <p>Hello <strong>${name}</strong>,</p>
              <p>Your official raffle number is:</p>
              <div style="font-size: 32px; font-weight: bold; background-color: #f9e7f7; padding: 15px; border-radius: 8px; display: inline-block; color: #e33286;">
                ${number}
              </div>
              <p>Good luck! 🍀</p>
            </div>
          `,
        });

        if (emailError) {
          console.error('Resend failed to send email:', emailError);
        } else {
          console.log(`[Email Sent] Successfully sent to ${email}`);
        }
      } catch (err) {
        console.error('Failed to send email:', err);
      }
    } else {
      console.log(`[Email Mock] Sent to ${email}: ${number}`);
    }

    return res.status(201).json({
      message: 'Successfully registered',
      number: participant.number,
      isExisting: false
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// Middleware for Admin
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${ADMIN_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// 2. Get Participants
app.get('/api/admin/participants', requireAdmin, async (req, res) => {
  try {
    const participants = await prisma.participant.findMany({
      orderBy: { createdAt: 'desc' },
    });
    const count = await prisma.participant.count();
    
    return res.json({ count, participants });
  } catch (error) {
    console.error('Get Participants Error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// 3. Draw Winners
app.post('/api/admin/draw', requireAdmin, async (req, res) => {
  try {
    const { count } = req.body;
    const numToDraw = parseInt(count) || 1;

    // Get all eligible (non-winning) participants
    const eligible = await prisma.participant.findMany({
      where: { isWinner: false },
    });

    if (eligible.length === 0) {
      return res.status(400).json({ error: 'No eligible participants left.' });
    }

    const winnersToPick = Math.min(numToDraw, eligible.length);
    
    // Shuffle array (Fisher-Yates)
    for (let i = eligible.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [eligible[i], eligible[j]] = [eligible[j], eligible[i]];
    }

    const selectedWinners = eligible.slice(0, winnersToPick);
    const winnerIds = selectedWinners.map(w => w.id);

    // Mark as winners
    await prisma.participant.updateMany({
      where: { id: { in: winnerIds } },
      data: { isWinner: true },
    });

    return res.json({ winners: selectedWinners });
  } catch (error) {
    console.error('Draw Error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// 4. Export CSV
app.get('/api/admin/export', requireAdmin, async (req, res) => {
  try {
    const participants = await prisma.participant.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const csvData = stringify(participants, {
      header: true,
      columns: ['id', 'name', 'email', 'number', 'isWinner', 'createdAt']
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=participants.csv');
    return res.send(csvData);
  } catch (error) {
    console.error('Export Error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
