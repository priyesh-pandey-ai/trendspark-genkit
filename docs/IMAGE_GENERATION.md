# AI Image Generation Feature

## Overview

TrendSpark now includes AI-powered image generation for all content kits. Images are automatically generated for each piece of content using the free Pollinations.AI service, with no API key required.

## Features

### ✨ Automatic Image Generation
- **Toggle On/Off**: Choose whether to generate images when creating content
- **Default Enabled**: Image generation is enabled by default for the best experience
- **Platform-Optimized**: Images are sized perfectly for each social media platform

### 🎨 Platform-Specific Dimensions
- **Instagram**: 1080×1080 (square)
- **LinkedIn**: 1200×627 (landscape, professional)
- **Twitter**: 1200×675 (landscape, social)
- **Facebook**: 1200×630 (landscape, social)
- **TikTok**: 1080×1920 (portrait, vertical video)

### 🔄 Regenerate Images
- **Individual Control**: Regenerate images for specific posts
- **Quick Updates**: Refresh any image that doesn't meet your expectations
- **No Limits**: Generate as many variations as you need

### 📊 Content Library Integration
- **Visual Preview**: See thumbnail images in your content library
- **Smart Filtering**: Filter content by "With images" or "Without images"
- **Export Support**: CSV exports include image URLs

## How It Works

### Smart Prompt Generation
The system creates intelligent image prompts based on:
1. **Content Hook**: The main topic/message of your post
2. **Platform**: Determines the visual style (professional, social, dynamic)
3. **Niche**: Your brand's industry/focus area
4. **Trend Context**: The trend you're posting about

**Example Prompt Generation**:
- For LinkedIn: "professional, corporate, minimalist, clean, business-appropriate image about AI in marketing"
- For Instagram: "vibrant, aesthetic, eye-catching, modern, social media friendly image about coffee trends"

### Using Pollinations.AI
- **Free Service**: No API key or payment required
- **High Quality**: Enhanced images with no watermarks
- **Fast Generation**: Typical response time of 2-5 seconds per image
- **No Rate Limits**: Generate as many images as you need

## Usage Guide

### Generating New Content with Images

1. Navigate to the **Generate** page
2. Select your brand and enter a trend title
3. Choose your target platforms
4. Keep **"Generate Images"** checkbox enabled (default)
5. Click **"Generate Content Kit"**
6. Wait for both content and images to generate
7. View your content with beautiful AI-generated images

### Generating Content Without Images

1. Follow steps 1-3 above
2. **Uncheck** the **"Generate Images"** checkbox
3. Click **"Generate Content Kit"**
4. Content will be generated without images

### Regenerating Individual Images

If you're not satisfied with a generated image:

1. Find the content card in the results
2. Click the **"Regenerate Image"** button
3. Wait for the new image to load (2-5 seconds)
4. The new image will replace the old one automatically

### Viewing Images in Content Library

1. Navigate to **Content Library**
2. See thumbnail images in the leftmost column
3. Use the **"Images"** filter to:
   - View all content
   - View only content with images
   - View only content without images

### Exporting with Images

#### From Generate Page
1. After generating content, click **"Download All as CSV"**
2. Open the CSV file
3. Find image data in columns:
   - `ImageURL`: Direct link to the image
   - `ImagePrompt`: The prompt used to generate it

#### From Content Library
1. Apply any filters you want
2. Click **"Export to CSV"**
3. Image URLs and prompts are included in the export

## Technical Details

### Image URLs
Generated images use the Pollinations.AI format:
```
https://image.pollinations.ai/prompt/{encoded_prompt}?width={w}&height={h}&nologo=true&enhance=true
```

Parameters:
- `nologo=true`: Removes watermarks
- `enhance=true`: Improves image quality
- `width` & `height`: Platform-specific dimensions

### Database Storage
- `image_url`: TEXT field storing the full Pollinations.AI URL
- `image_prompt`: TEXT field storing the prompt used for generation
- Both fields are nullable (optional)

## Best Practices

### ✅ Do's
- ✅ Generate images for professional platforms (LinkedIn, Instagram)
- ✅ Regenerate if the first image doesn't match your content
- ✅ Use the image filter to track which content needs images
- ✅ Include images in your CSV exports for scheduling tools

### ❌ Don'ts
- ❌ Don't expect perfect matches every time (AI-generated content varies)
- ❌ Don't use images that include unintended text or elements
- ❌ Don't skip reviewing images before publishing

## Troubleshooting

### Image Not Loading
**Problem**: Image generation fails or shows an error

**Solutions**:
1. Click "Regenerate Image" to try again
2. Check your internet connection
3. The Pollinations.AI service might be temporarily unavailable

### Image Doesn't Match Content
**Problem**: Generated image doesn't fit the content

**Solutions**:
1. Click "Regenerate Image" for a new variation
2. The prompt includes your niche and trend context
3. Different generations produce different results

### Slow Generation
**Problem**: Images take too long to generate

**Solutions**:
1. Generation typically takes 2-5 seconds per image
2. Multiple images generate in parallel
3. Check your internet connection speed

## FAQ

**Q: Does image generation cost anything?**
A: No! Pollinations.AI is completely free with no API key required.

**Q: Can I use custom dimensions?**
A: Currently, dimensions are fixed per platform and optimized for each social media channel.

**Q: How many images can I generate?**
A: There are no limits. Generate as many as you need!

**Q: Can I upload my own images instead?**
A: Currently, only AI-generated images are supported. This feature may be added in the future.

**Q: What if I don't like any of the generated images?**
A: Keep clicking "Regenerate Image" until you find one you like. Each generation is unique.

**Q: Will images be saved even if generation fails?**
A: No, if image generation fails, the content kit is saved without an image. You can regenerate later.

## Limitations

1. **AI Variability**: Images are AI-generated and may not always perfectly match the content
2. **No Manual Prompts**: You cannot currently customize the image generation prompt
3. **No Local Upload**: You cannot upload your own images (yet)
4. **Fixed Dimensions**: Platform dimensions are fixed and not customizable in the UI

---

**Note**: This feature uses the free Pollinations.AI service. Image quality and generation speed depend on the external service's availability and performance.
