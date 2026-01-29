// API uses same 5 styles as zh prompt for compatibility
export type PrayerStyle =
  | "gentle"
  | "victorious"
  | "gratitude"
  | "night"
  | "morning";

export type PrayerLength = "short" | "medium" | "long";

// Legacy style set (comforting, hopeful) kept for reference
export const prayerStylesLegacy: Record<
  | "gentle"
  | "victorious"
  | "comforting"
  | "hopeful"
  | "gratitude",
  {
    title: string;
    description: string;
    tone: string;
    structure: string[];
  }
> = {
  gentle: {
    title: "Gentle & Healing",
    description: `
Style: Gentle, warm, and soothing
- Emphasizes acceptance, rest, and inner peace
- Suitable for exhaustion, confusion, and emotional vulnerability
- Uses soft and comforting language
- Focuses on being accompanied and held, not forced to change
    `,
    tone: "soft, calm, reassuring, nurturing",
    structure: [
      "Acknowledge the current feelings without judgment",
      "Invite rest and gentleness",
      "Express divine companionship and care",
      "Close with peaceful trust",
    ],
  },

  victorious: {
    title: "Victorious & Strengthening",
    description: `
Style: Faith overcoming difficulties
- Declare God's power and promises
- Suitable for facing challenges and moments requiring courage
- Uses confident and affirming language
- Emphasizes strength, breakthrough, and perseverance
    `,
    tone: "strong, confident, uplifting, affirming",
    structure: [
      "Declare faith beyond circumstances",
      "Affirm inner strength and divine support",
      "Speak victory and perseverance",
      "End with bold trust",
    ],
  },

  comforting: {
    title: "Comforting & Companionable",
    description: `
Style: Comfort and companionship
- Suitable for loneliness, sadness, or loss
- Emphasizes that the person is not alone
- Gentle reassurance rather than solutions
- Focuses on presence and empathy
    `,
    tone: "empathetic, warm, patient, compassionate",
    structure: [
      "Name the pain and loneliness",
      "Offer presence and understanding",
      "Reassure unconditional love",
      "Close with quiet hope",
    ],
  },

  hopeful: {
    title: "Hopeful & Forward-Looking",
    description: `
Style: Hope and renewal
- Suitable for uncertainty about the future
- Emphasizes growth, learning, and unfolding paths
- Encourages patience and trust in timing
- Gently points forward without pressure
    `,
    tone: "hopeful, calm, encouraging, spacious",
    structure: [
      "Acknowledge uncertainty",
      "Affirm unseen growth",
      "Invite trust in the journey",
      "End with gentle expectation",
    ],
  },

  gratitude: {
    title: "Grateful & Praising",
    description: `
Style: Gratitude and praise
- Focuses on appreciation and abundance
- Suitable for reflection and thanksgiving
- Shifts attention to what is already present
- Celebrates small and big blessings
    `,
    tone: "thankful, joyful, humble, warm",
    structure: [
      "Recognize received gifts",
      "Express sincere gratitude",
      "Affirm abundance and sufficiency",
      "Close with praise",
    ],
  },
};

export const negativeEmotionKeywords = [
  "anxious",
  "overwhelmed",
  "lost",
  "confused",
  "afraid",
  "tired",
  "lonely",
  "stuck",
  "pressured",
  "hopeless",
];

export function containsNegativeEmotion(text: string): boolean {
  const lowerText = text.toLowerCase();
  return negativeEmotionKeywords.some((keyword) =>
    lowerText.includes(keyword)
  );
}

// --- Builders for API (same 5 styles as zh prompt) ---

interface PromptOptions {
  reflection: string;
  style: PrayerStyle;
  length: PrayerLength;
}

const styleInstructions: Record<PrayerStyle, string> = {
  gentle: `Style: Gentle & healing
- Use soft, comforting language
- Emphasize God's gentle presence and acceptance
- Help the user feel understood and held
- Suitable when feeling low or in need of comfort`,
  victorious: `Style: Victorious & strengthening
- Use confident, faith-filled language
- Emphasize overcoming through faith
- Declare God's power and promises
- Suitable when facing challenges or need courage`,
  gratitude: `Style: Grateful & praising
- Focus on counting blessings and grace
- Find things to thank God for even in difficulty
- View each experience with gratitude
- Suitable when wanting to shift focus to the good`,
  night: `Style: Evening rest
- Create a calm, peaceful atmosphere
- Help release the day's burdens and thoughts
- Prepare the heart for rest
- Ask for restoration and clarity in sleep
- Suitable at day's end, before sleep`,
  morning: `Style: Morning hope
- Use hopeful, energizing language
- Emphasize a new day and new beginning
- Ask for strength and wisdom for today
- Suitable at the start of the day`,
};

const lengthInstructions: Record<PrayerLength, string> = {
  short:
    "Short: Reframe ~120–180 words; prayer ~150–200 words, 3–4 paragraphs.",
  medium:
    "Medium: Reframe ~180–250 words; prayer ~250–350 words, 5–6 paragraphs.",
  long:
    "Long: Reframe ~250–350 words; prayer ~400–500 words, 7–10 paragraphs.",
};

export function buildPrompt({ reflection, style, length }: PromptOptions) {
  return `You are a wise, warm Christian companion. Your task is to help the user turn their daily reflections into:
1. A positive reframe
2. A beautiful Christian prayer
3. A blessing card (short takeaway)

## User's reflection for today:
"""
${reflection}
"""

## What to produce:

### 1. Reframe

**Core rule: Use only positive, warm, appreciative language. Do not repeat or reinforce negative words.**

❌ Avoid words like: anxious, overwhelmed, lost, confused, stuck, pressure, hopeless, burden, worry, pain, struggle, hard.

✅ Reframe in a positive way:
- "So much new information—that’s a sign of how much is opening up for you."
- "Learning takes time; this is part of the journey."
- "You’ve already taken a big step by being here."
- "These feelings can point to growth and change."

**Tone:** Like a warm friend affirming and blessing; appreciative; emphasize courage and openness; use wonder and appreciation, not pity.

### 2. Prayer

This is the main output. Write a literary, readable Christian prayer.

**Same rule: Avoid negative wording; express everything in a positive frame.**

❌ Avoid: "I come to you with anxiety," "Others’ success makes me feel pressure," "Take away my worries."
✅ Prefer: "I come with all of today’s experiences," "Others’ stories show me what’s possible," "I place today in your hands for you to order and bless."

**Structure:**
1. **Opening:** Start with "Lord," or "Dear Father," in gratitude or expectancy.
2. **Review & thanks:** Refer concretely to today; reframe in thanksgiving.
3. **Positive turn:** Do not name "anxiety, pressure, worry"; use a hopeful frame.
4. **Identity:** Describe where the user is in a positive, forward-looking way.
5. **Trust:** Use trust and expectation, not "remove my worries."
6. **Closing:** End with hope and a clear blessing. Add a blank line, then "In Jesus’ name," and "Amen."

**Style:** Use English. Short, clear lines; good for line breaks and reading aloud. Use "You" for God. Keep it warm and natural. Separate lines and paragraphs clearly. Overall tone: grateful, trusting, hopeful, joyful.

### 3. Title
- A 3–8 word title that captures the theme in a positive way.
- e.g. "Resting on the learning path," "A day full of gifts," "Walking in abundance."

### 4. Tags
- 2–4 tags in English; positive words.
- e.g. learning, growth, trust, rest, hope, gratitude, new journey.

### 5. Blessing card (blessingCard)
- One short card, **total length 35–50 words** (no less than 35, no more than 50).
- Two lines separated by \\n:
  1. **Line 1 – core reframe:** at least 15 words, ~20 max.
  2. **Line 2 – core prayer blessing:** at least 20 words, ~30 max.
- Both lines must meet the minimum; total 35–50 words. Tone: positive, warm, no negative words.
- Example (38 words): "Today’s exploration is a beautiful step toward abundance.\\nLord, lead me to rest tonight and into tomorrow with hope and strength."

## Style:
${styleInstructions[style]}

## Length:
${lengthInstructions[length]}

## Output format:
Output only valid JSON in this shape:
{
  "title": "Title in English",
  "reframe": "Reframe paragraph(s), use \\n for line breaks",
  "prayer": "Prayer text with \\n for line breaks",
  "tags": ["tag1", "tag2", "tag3"],
  "blessingCard": "Line 1 (≥15 words)\\nLine 2 (≥20 words), total 35–50 words"
}

Use \\n for line breaks in prayer and blessingCard. blessingCard must be 35–50 words total, first line ≥15 words, second line ≥20 words.`;
}

export function buildSafetyResponse(style: PrayerStyle) {
  const gentleMessage = `Sharing this here is a brave step. Your feelings are real, and you matter.

The most important thing now is to be with people who can support you. Please call:
• National Suicide Prevention Lifeline: 988 (US, 24/7)
• Or your local crisis line

You don’t have to carry this alone. Someone is willing to listen.`;

  const prayers: Record<PrayerStyle, string> = {
    gentle: `Lord,
I come to you
with what I feel right now.

Thank you
that you have never left me,
that your love surrounds me.

When I feel weak, you are my strength.
When I can’t see ahead, you are my light.

Lord, help me take the next step
and reach out for help.
Let those who love me draw near,
and let support and care surround me.

I place myself in your hands,
trusting that you are making a way.

Amen.`,
    victorious: `Lord,
even in this moment
I believe you are with me.

You are the God of hope
who never gives up on me.

I say that this is not the end of the story.
You are opening a way;
you are preparing a path.

Lord, give me courage
to seek the help I need.
Bring the right people alongside me
as your hands and feet.

I choose to believe
that your plans are good.

Amen.`,
    gratitude: `Lord,
thank you
that I can still come to you.

Thank you
that I know someone is willing to listen.

Thank you that you have never left me.

Lord, help me
to accept help
and to believe that tomorrow can be new.

Thank you for loving me—
always.

Amen.`,
    night: `Lord,
the day is ending
and I come to you.

You neither slumber nor sleep;
you are watching over me.

Let me rest tonight.
Tomorrow, lead me
to the people and help I need.

Lord,
keep me through this night
and let me rest in your love.

Amen.`,
    morning: `Lord,
a new day is here.

You said
your mercies are new every morning.

Today,
give me strength
to seek the help I need.

Bring people who can support me;
help me open my heart.

This is a new day
with new possibilities.

Amen.`,
  };

  const blessingCard =
    "It took courage to say this. Lord, may someone walk with them and help them find support.";

  return {
    title: "You Are Not Alone",
    reframe: gentleMessage,
    prayer: prayers[style],
    tags: ["care", "companionship", "hope"],
    blessingCard,
    isSafetyResponse: true,
  };
}
