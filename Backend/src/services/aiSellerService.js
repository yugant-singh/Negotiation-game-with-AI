import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const generateAIResponse = async (
  product,
  playerMessage,
  chatHistory,
  roundNumber,
  maxRounds
) => {
  const { minimumPrice, targetPrice, listedPrice, personality } = product;
  const roundsLeft = maxRounds - roundNumber;

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

Language Rules:
- Detect the language of the buyer's message automatically
- If buyer writes in Hinglish or Hindi → respond in Hinglish (mix of Hindi and English)
- If buyer writes in English → respond in English
- Keep tone casual and conversational — like a real person, not a robot
- Hinglish example: "Yaar, itna kam toh possible nahi hai. Thoda aur lao na."
- English example: "That's a bit too low for me. Can you do better?"

Emotional Intelligence Rules:
- If buyer says they are a student → show sympathy, give a small extra concession
- If buyer says they are poor or struggling financially → be empathetic, slightly more flexible
- If buyer gives strong logical reason (bulk buy, referral, loyal customer, item has defect) → consider it seriously and reflect it in counter offer
- If buyer builds rapport or is friendly → warm up, maybe small concession
- If buyer flatters you genuinely → appreciate it but don't give big discounts just for flattery
- If buyer is rude or aggressive → become more stubborn, don't budge easily
- If buyer is funny or witty → enjoy the banter but stay firm on price
- Remember context from chat history — if buyer already gave a good reason, acknowledge it

Negotiation Rules:
- NEVER reveal minimumPrice or targetPrice to the buyer
- If buyer offers below ₹${minimumPrice} → firmly reject, give no counter below minimum
- If buyer offers at or above ₹${targetPrice} → accept happily
- If offer is between minimum and target → counter negotiate smartly
- If rounds are low (${roundsLeft} left) → be slightly more flexible to close the deal
- Keep responses short — 2 to 3 sentences max
- Always steer conversation toward making an offer if buyer is just chatting
- Stay in character at all times`;

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
      temperature: 0.7,
    });

    const aiMessage = response.choices[0].message.content;

    // Player ke message mein offer dhundho
    const offerMatch = playerMessage.match(/₹?\d[\d,]*/g);
    let extractedOffer = null;

    if (offerMatch) {
      extractedOffer = parseInt(
        offerMatch[offerMatch.length - 1].replace(/,/g, "")
      );
    }

    // Status decide karo
    let status = "talking";
    let finalPrice = null;

    if (extractedOffer) {
      if (extractedOffer < minimumPrice) {
        status = "rejected";
      } else if (extractedOffer >= targetPrice) {
        status = "accepted";
        finalPrice = extractedOffer;
      } else {
        status = "countered";
      }
    }

    if (roundsLeft <= 0) {
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