const express = require('express');
const router = express.Router();
const { analyzeComplaint, generateSummary, textSimilarity, chatWithGemini, analyzeImageWithGemini } = require('../utils/aiEngine');
const Complaint = require('../models/Complaint');

// POST /api/ai/analyze — analyze complaint text for category + severity (Gemini-powered)
router.post('/analyze', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title && !description) {
      return res.status(400).json({ success: false, message: 'Title or description required' });
    }
    const result = await analyzeComplaint(title, description);
    res.json({ success: true, ai: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/ai/duplicates — find similar complaints nearby
router.post('/duplicates', async (req, res) => {
  try {
    const { title, description, coordinates } = req.body;
    if (!title && !description) {
      return res.status(400).json({ success: false, message: 'Title or description required' });
    }

    const fullText = `${title || ''} ${description || ''}`;
    let query = {};

    if (coordinates && coordinates.length === 2) {
      query['location'] = {
        $near: {
          $geometry: { type: 'Point', coordinates },
          $maxDistance: 2000
        }
      };
    }

    query['status'] = { $ne: 'Resolved' };
    const candidates = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .select('title description category location status createdAt images');

    const similar = candidates
      .map(c => {
        const candidateText = `${c.title} ${c.description}`;
        const similarity = textSimilarity(fullText, candidateText);
        return { complaint: c, similarity: Math.round(similarity * 100) };
      })
      .filter(s => s.similarity >= 25)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    res.json({
      success: true,
      duplicates: similar,
      count: similar.length,
      hasDuplicates: similar.length > 0
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/ai/image-analyze — analyze image using Gemini with fallback
router.post('/image-analyze', async (req, res) => {
  try {
    const { filename, category, title, description } = req.body;

    // Try Gemini first
    const geminiResult = await analyzeImageWithGemini(filename, title, description);
    if (geminiResult) {
      return res.json({
        success: true,
        imageAnalysis: {
          detectedTypes: [{ type: geminiResult.detectedType, confidence: geminiResult.confidence }],
          contextCategory: geminiResult.detectedType,
          isRelevant: geminiResult.isRelevant,
          tips: geminiResult.tips || [],
          message: geminiResult.message,
          poweredBy: 'gemini'
        }
      });
    }

    // Fallback to keyword matching
    const fname = (filename || '').toLowerCase();
    const context = `${title || ''} ${description || ''}`.toLowerCase();
    const imageHints = [];
    if (fname.match(/pothole|hole|road|crack|pit/)) imageHints.push({ type: 'pothole', confidence: 80 });
    if (fname.match(/garbage|trash|waste|dump|litter/)) imageHints.push({ type: 'garbage', confidence: 80 });
    if (fname.match(/water|leak|pipe|flood|sewage/)) imageHints.push({ type: 'water_leakage', confidence: 80 });
    if (fname.match(/light|lamp|street|dark|bulb/)) imageHints.push({ type: 'streetlight', confidence: 80 });
    if (fname.match(/drain|sewer|gutter|manhole/)) imageHints.push({ type: 'drainage', confidence: 80 });

    const tips = [];
    if (!filename) tips.push('Upload a clear photo of the issue for faster resolution');
    if (context.length < 20) tips.push('Add more details in the description for better AI analysis');

    res.json({
      success: true,
      imageAnalysis: {
        detectedTypes: imageHints,
        contextCategory: (await analyzeComplaint(title, description)).suggestedCategory,
        isRelevant: imageHints.length > 0 || context.length > 10,
        tips,
        message: imageHints.length > 0
          ? `Image appears to show: ${imageHints.map(h => h.type.replace(/_/g, ' ')).join(', ')}`
          : 'Photo uploaded — AI will use complaint text for analysis',
        poweredBy: 'fallback'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/ai/summary — generate smart summary (Gemini-powered)
router.post('/summary', async (req, res) => {
  try {
    const { title, description, category, address } = req.body;
    const summary = await generateSummary(title, description, category, address);
    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/ai/chat — Gemini-powered chatbot
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }
    const reply = await chatWithGemini(message);
    res.json({ success: true, reply, poweredBy: reply ? 'gemini' : 'fallback' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
