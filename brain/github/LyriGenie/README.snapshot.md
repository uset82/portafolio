<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/LyriGenie/blob/main/README.md; checkedOn: 2026-07-31; redactions: 0 -->

# LyriGenie

## Project Overview

LyriGenie is a web application that transforms lyric viewing into an interactive experience by synchronizing lyrics across multiple music platforms with engaging design elements.

## Features

- **Multi-platform Integration**: Works with both YouTube videos and Spotify tracks
- **Lyrics Synchronization**: Automatically syncs lyrics with audio playback
- **Karaoke-style Display**: Provides word-by-word highlighting as the song progresses
- **AI-powered Analysis**: Uses OpenAI to analyze song themes and emotions
- **Similar Song Recommendations**: Suggests similar songs based on lyrics and style
- **Export Options**: Download lyrics as TXT or SRT subtitle format
- **Responsive Design**: Works on various screen sizes with Studio Ghibli-inspired visual elements
- **Dark Mode**: Toggle between light and dark themes

## Functionality

1. **Input**: User pastes a YouTube or Spotify link into the application
2. **Extraction**: The app extracts media information (title, artist, thumbnails)
3. **Lyrics Retrieval**: The system obtains lyrics through various methods:
   - YouTube captions when available
   - Audio transcription using OpenAI Whisper API
   - External lyrics services and APIs
4. **Synchronization**: The app aligns lyrics with the audio using:
   - Existing timing data from captions
   - Beat detection algorithms
   - Intelligent timing estimation for better flow
5. **Display**: Shows synchronized lyrics with karaoke-style highlighting that follows along with the music
6. **Enhanced Features**: Offers additional AI-powered functionality:
   - Song analysis that reveals themes, emotions, and musical structure
   - Similar song recommendations based on content and style
   - High-quality exports for offline use

## APIs Used

LyriGenie leverages several external APIs to provide its functionality:

1. **YouTube Data API v3**
   - Used for fetching video metadata (title, channel, thumbnails)
   - Accessing caption tracks and their content
   - Required for YouTube video processing

2. **Spotify Web API**
   - Used for retrieving track information
   - Accessing album artwork and artist details
   - Required for Spotify track processing

3. **OpenAI API**
   - Powers the GPT-4o language model for lyrics analysis
   - Provides Whisper API for audio transcription
   - Used for generating similar song recommendations
   - Optional but enhances the application's capabilities

## Installation

### Prerequisites
- Python 3.10+
- Git
- pip (Python package manager)

### Setup Steps
1. Clone the repository from GitHub
2. Create a Python virtual environment
3. Install dependencies from requirements.txt

The application requires packages like Flask, OpenAI, YouTubeDL, and SQLAlchemy.

## API Requirements

To use LyriGenie with full functionality, you need to obtain these API keys:

1. **YouTube Data API v3** - For video metadata and captions
2. **Spotify API** - For track information and album details
3. **OpenAI API** - For AI-powered features and transcription

### Environment Variables
Set up the following environment variables:
- YOUTUBE_API_KEY
- SPOTIFY_CLIENT_ID
- SPOTIFY_CLIENT_SECRET
- OPENAI_API_KEY
- SESSION_SECRET

## Security Note

- Never commit API keys to version control
- Use environment variables for all sensitive credentials
- No personal API keys are included in this repository

## Running the Application

To run the application locally:
1. Ensure all dependencies and API keys are configured
2. Run the application with Python or Gunicorn
3. Access the web interface through your browser

## Project Structure

The application follows a modular architecture:
- app.py - Main Flask application
- services/ - Service modules for external APIs
- static/ - Frontend assets (CSS, JS, images)
- templates/ - HTML templates
- utils/ - Utility functions

## Troubleshooting

Common issues include:
- YouTube bot detection when accessing certain videos
- API rate limits on external services
- Missing lyrics for some songs

Enable debug mode for more detailed logging when troubleshooting issues.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Studio Ghibli for design inspiration
- OpenAI for AI capabilities
- YouTube and Spotify for their APIs
- The many open source libraries that made this project possible
