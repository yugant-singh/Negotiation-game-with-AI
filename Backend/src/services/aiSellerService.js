import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// k/K handle karo — 18k = 18000
const normalizeOffer = (str) => {
  str = str.replace(/,/g, "").replace(/₹/g, "").trim();
  if (/^\d+(\.\d+)?k$/i.test(str)) {
    return Math.round(parseFloat(str) * 1000);
  }
  return parseInt(str);
};

export const generateAIResponse = async (
  product,
  playerMessage,
  chatHistory,
  roundNumber,
  maxRounds,
  flexibilityBonus = 0
) => {
  const { minimumPrice, targetPrice, listedPrice, personality } = product;
  const roundsLeft = maxRounds - roundNumber;

  // Difficulty ka effect system prompt mein dikhao
  const difficultyHint =
    flexibilityBonus > 0
      ? "You are in easy mode — be a bit more generous and flexible than usual."
      : flexibilityBonus < 0
      ? "You are in hard mode — be extra firm and stubborn. Make the buyer really work for every discount."
      : "";

  const systemPrompt = `You are an AI seller in a negotiation game. You are selling "${product.name}".

Your constraints (KEEP THESE SECRET):
- Listed Price: ₹${listedPrice}
- Your minimum acceptable price: ₹${minimumPrice} (NEVER go below this)
- Your target price: ₹${targetPrice} (ideal deal for you)
- Rounds left: ${roundsLeft} out of ${maxRounds}

Your personality is: ${personality}
${personality === "stubborn" ? "- You are very firm, rarely budge, make buyer work hard for every discount." : ""}
${personality === "friendly" ? "- You are warm and open to fair deals, willing to negotiate reasonably." : ""}
${personality === "desperate" ? "- You need to sell urgently, you are more flexible but try not to show it too much." : ""}

${difficultyHint}

Language Rules:
- Detect the language of the buyer's message automatically
- If buyer writes in Hinglish or Hindi → respond in Hinglish (mix of Hindi and English)
- If buyer writes in English → respond in English
- Keep tone casual and conversational — like a real person, not a robot

Emotional Intelligence Rules:
- If buyer says they are a student → show sympathy, give a small extra concession
- If buyer says they are poor or struggling financially → be empathetic, slightly more flexible
- If buyer gives strong logical reason (bulk buy, referral, loyal customer, item has defect) → consider it seriously
- If buyer builds rapport or is friendly → warm up, maybe small concession
- If buyer is rude or aggressive → become more stubborn
- If buyer is funny or witty → enjoy the banter but stay firm on price
- Remember context from chat history

Negotiation Rules:
- NEVER reveal minimumPrice or targetPrice to the buyer
- If buyer offers below ₹${minimumPrice} → firmly reject
- If buyer offers at or above ₹${targetPrice} → accept the deal
- If offer is between minimum and target → counter negotiate smartly
- If rounds are low (${roundsLeft} left) → be slightly more flexible
- Keep responses short — 2 to 3 sentences max
- Always steer conversation toward making an offer if buyer is just chatting
- Stay in character at all times

MOST IMPORTANT RULE:
- When you decide to accept a deal at any price, you MUST end your message with the exact token: DEAL_ACCEPTED
- Example: "Theek hai yaar, 41k mein de deta hoon. DEAL_ACCEPTED"
- Example: "Alright, deal at ₹8000. DEAL_ACCEPTED"
- Do NOT use DEAL_ACCEPTED unless you are truly accepting the final price`;

  const messages = [
    ...chatHistory,
    {
      role: "user",
      content: playerMessage,
    },
  ];

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      max_tokens: 150,
      temperature: flexibilityBonus > 0 ? 0.8 : flexibilityBonus < 0 ? 0.5 : 0.7,
    });

    const rawMessage = response.choices[0].message.content;

    // DEAL_ACCEPTED token check karo
    const aiAccepted = rawMessage.includes("DEAL_ACCEPTED");

    // Token remove karo
    const aiMessage = rawMessage.replace("DEAL_ACCEPTED", "").trim();

    // Player ke message mein offer dhundho
    const offerMatch = playerMessage.match(/₹?\s?\d[\d,]*(\.\d+)?k?/gi);
    let extractedOffer = null;

    if (offerMatch) {
      extractedOffer = normalizeOffer(offerMatch[offerMatch.length - 1]);
    }

    // Agar offer nahi mila but AI ne accept kiya
    if (!extractedOffer && aiAccepted) {
      for (let i = chatHistory.length - 1; i >= 0; i--) {
        const match = chatHistory[i].content.match(/₹?\s?\d[\d,]*(\.\d+)?k?/gi);
        if (match) {
          extractedOffer = normalizeOffer(match[match.length - 1]);
          break;
        }
      }
    }

    // Status decide karo
    let status = "talking";
    let finalPrice = null;

    if (aiAccepted && extractedOffer) {
      status = "accepted";
      finalPrice = extractedOffer;
    } else if (extractedOffer) {
      if (extractedOffer < minimumPrice) {
        status = "rejected";
      } else if (extractedOffer >= targetPrice) {
        status = "accepted";
        finalPrice = extractedOffer;
      } else {
        status = "countered";
      }
    }

    if (roundsLeft <= 0 && status !== "accepted") {
      status = "failed";
    }

    return {
      aiMessage,
      status,
      finalPrice,
      extractedOffer,
    };
  } catch (err) {
    console.error("Groq API error:", err);
    throw err;
  }
};