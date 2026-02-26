# Wordle Helper AI

An intelligent Wordle helper powered by AI that provides smart word suggestions and real-time candidate filtering.

## ✨ Features

- 🤖 **AI-Powered Starting Words**: Daily curated word recommendations from DeepSeek AI
- 🔍 **Real-time Filtering**: Instant candidate word filtering based on color feedback
- 🎯 **Smart Suggestions**: Get the top 10 best words for your next guess
- 🏆 **Game Modes**: Support for both Classic and Hard modes
- 📊 **Live Stats**: See remaining candidates and letter distribution

## 🗂️ Wordlist Management

### Automatic Updates

This project uses an automated wordlist update system to stay synchronized with the official Wordle word list.

- **Source**: [stuartpb/wordles](https://github.com/stuartpb/wordles) (The New York Times official word list)
- **Update Frequency**: Automatically checks for updates on the 1st of every month
- **Process**: GitHub Actions creates a Pull Request when updates are detected

### Manual Update

You can manually trigger an update:

```bash
# Run the update script
node scripts/update-wordlist.js

# Or trigger the GitHub Action manually
# Go to: Actions → Update Wordle Wordlist → Run workflow
```

### Wordlist Details

| File                     | Count  | Description                     |
| ------------------------ | ------ | ------------------------------- |
| `data/answers.json`      | 2,309  | Possible answer words           |
| `data/validGuesses.json` | 10,638 | Valid guess words (non-answers) |

**Note**: The New York Times periodically updates the word list to remove obscure, insensitive, or offensive words.

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Set up environment variables (see `.env.example`)
4. Run development server: `pnpm dev`

## 📝 SEO

- **Title**: Wordle Helper | Smart Solver, Hints & Best Starting Words
- **Description**: Enter your color feedback to instantly filter remaining answers, get opening word suggestions, letter stats, and next-move hints—works for classic and hard mode.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 + React 19
- **AI**: DeepSeek API
- **Database**: Supabase
- **Language**: TypeScript

## 📄 License

MIT
