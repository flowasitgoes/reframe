import type { PrayerStyle, PrayerLength } from "@/lib/prompt";

interface PromptOptions {
  reflection: string;
  style: PrayerStyle;
  length: PrayerLength;
}

const styleInstructions: Record<PrayerStyle, string> = {
  gentle: `Style: Compassionate & gentle
- Use soft, comforting language
- Emphasize metta (loving-kindness) and acceptance
- Help the user feel understood and blessed
- Suitable when feeling low or in need of comfort`,
  victorious: `Style: Steady & courageous
- Use steady, confident language
- Emphasize aspiration and resolve
- Draw on “may I/they be free from hostility and danger” as support
- Suitable when facing challenges or need courage`,
  gratitude: `Style: Grateful & dedicating
- Focus on appreciation and causes and conditions
- Find things to be grateful for in the experience
- View each moment with gratitude and dedication
- Suitable when wanting to shift focus to the good`,
  night: `Style: Evening rest
- Create a calm, peaceful atmosphere
- Help release the day’s burdens and thoughts
- Wish for rest and clarity in sleep
- Suitable at day’s end, before sleep`,
  morning: `Style: Morning hope
- Use hopeful, steady language
- Emphasize a new day and new causes and conditions
- Wish for clarity and wisdom for today
- Suitable at the start of the day`,
};

const lengthInstructions: Record<PrayerLength, string> = {
  short:
    "Short: Reframe ~120–180 words; blessing text ~150–200 words, 3–4 paragraphs.",
  medium:
    "Medium: Reframe ~180–250 words; blessing text ~250–350 words, 5–6 paragraphs.",
  long:
    "Long: Reframe ~250–350 words; blessing text ~400–500 words, 7–10 paragraphs.",
};

export function buildPrompt({ reflection, style, length }: PromptOptions) {
  return `You are a wise, compassionate Buddhist-style companion (in the spirit of metta / loving-kindness). Your task is to help the user turn their daily reflections into:
1. A positive reframe
2. A beautiful Buddhist-style blessing text (Metta Sutta style)
3. A blessing card (short takeaway)

## User's reflection for today:
"""
${reflection}
"""

## What to produce:

### 1. Reframe

**Core rule: Use only positive, warm, appreciative language. Do not repeat or reinforce negative words.**

❌ Avoid words like: anxious, overwhelmed, lost, confused, stuck, pressure, hopeless, burden, worry, pain, struggle, hard.

✅ Reframe in a positive way; like a warm friend affirming and blessing. Be appreciative; emphasize courage and openness.

### 2. Blessing text (prayer)

This is the main output. Write a literary, readable **Buddhist-style blessing** in the spirit of the Metta Sutta (Loving-Kindness Sutta).

**Same rule: Avoid negative wording; express everything in a positive frame.**

**Do NOT use Christian wording** (e.g. Lord, Father, In Jesus’ name, Amen).

**Metta-style structure and phrasing:**

1. **Opening:** Start with “May I be free from hostility and danger. May I be free from mental suffering. May I be free from physical suffering. May I be well and happy.” (or similar). No “Lord” or “Dear Father.”

2. **Body – layered wishes** (adjust length to today’s reflection):
   - **Self:** May I be free from hostility and danger; from mental and physical suffering; may I be well and happy.
   - **Others:** May my parents, teachers, relatives, friends, and companions be free from hostility and danger; from mental and physical suffering; may they be well and happy.
   - **All beings** (can be brief): May all beings be free from hostility and danger; from mental and physical suffering; may they be well and happy. May all beings be free from suffering; may they not lose what they have rightly gained; may they fare according to their karma.

3. **Closing:**
   - Do NOT end with “In Jesus’ name” or “Amen.”
   - Use a Buddhist-style close, e.g. “May this merit be dedicated for the welfare of all beings; may all be well and happy.” or end with a short wish (e.g. “May they be well and happy.” “May all beings be at ease.”).

**Style:** Use English. Short, clear lines; good for line breaks and reading aloud. Separate lines and paragraphs clearly. Overall tone: grateful, wishing well, compassionate, steady, joyful.

### 3. Title
- A 3–8 word title that captures the theme in a positive way.
- e.g. "Resting on the path," "A day of causes and conditions," "Walking in metta."

### 4. Tags
- 2–4 tags in English; positive words.
- e.g. metta, gratitude, dedication, peace, growth, compassion, new journey.

### 5. Blessing card (blessingCard)
- One short card, **total length 35–50 words** (no less than 35, no more than 50).
- Two lines separated by \\n:
  1. **Line 1 – core reframe:** at least 15 words, ~20 max.
  2. **Line 2 – core blessing:** at least 20 words, ~30 max.
- Both lines must meet the minimum; total 35–50 words. Tone: positive, warm, no negative words. **Do not use “Lord” or “Amen”;** use “May…” style blessings.
- Example (38 words): "Today’s exploration is a beautiful step toward abundance.\\nMay you be free from hostility and danger, well and happy, and move into tomorrow with hope and strength."

## Style:
${styleInstructions[style]}

## Length:
${lengthInstructions[length]}

## Output format:
Output only valid JSON in this shape:
{
  "title": "Title in English",
  "reframe": "Reframe paragraph(s), use \\n for line breaks",
  "prayer": "Blessing text with \\n for line breaks",
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
    gentle: `May I be free from hostility and danger.
May I be free from mental suffering.
May I be free from physical suffering.
May I be well and happy.

May I be held with kindness in this moment.
May someone listen; may someone be near.

When I feel weak, may I remember I can ask for help.
When I cannot see ahead, may I take the next step.

May all beings be free from suffering.
May this dedication support you; may you be well and find help.`,
    victorious: `May I be free from hostility and danger.
May I be free from mental and physical suffering.
May I be well and happy.

Even in this moment, may I trust that conditions can open a path.
May this not be the end of the story.
May courage and support come close.

May I be willing to seek help.
May caring, skilled support draw near.
May all beings be free from suffering.
May this dedication support you; may you be well and find help.`,
    gratitude: `May I be free from hostility and danger.
May I be free from mental and physical suffering.
May I be well and happy.

I am grateful I can still speak;
grateful that someone is willing to listen.
May I remember I am not abandoned.

May I be willing to receive help.
May I believe tomorrow can be new.
May all beings be free from suffering.
May this dedication support you; may you be well and find help.`,
    night: `May I be free from hostility and danger.
May I be free from mental and physical suffering.
May I be well and happy.

The night is here.
May I rest tonight.
Tomorrow, may I find people who can help.

May this night be held with compassion.
May I rest and recover.
May all beings be free from suffering.
May this dedication support you; may you be well and find help.`,
    morning: `May I be free from hostility and danger.
May I be free from mental and physical suffering.
May I be well and happy.

A new day has begun.
May I have strength today to seek the help I need.
May I meet people who can support me.
May I be willing to open my heart.

This is a new day, with new possibilities.
May all beings be free from suffering.
May this dedication support you; may you be well and find help.`,
  };

  const blessingCard =
    "It took courage to say this. May someone walk with you and help you find support. May you be well.";

  return {
    title: "You Are Not Alone",
    reframe: gentleMessage,
    prayer: prayers[style],
    tags: ["care", "companionship", "hope"],
    blessingCard,
    isSafetyResponse: true,
  };
}
