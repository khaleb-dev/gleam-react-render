import { toast } from "sonner";

interface ProfileCardData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  jobPosition?: string;
  profileImageUrl: string;
  coverImageUrl: string;
}

export class ProfileCardGenerator {
  static async generateAndDownload(data: ProfileCardData) {
    try {
      console.log('Starting profile card generation with data:', data);

      // Create a canvas element with card dimensions
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Set canvas dimensions
      canvas.width = 800;
      canvas.height = 600;

      // Load images
      const [profileImg, logoImg] = await Promise.all([
        this.loadImage(data.profileImageUrl),
        this.loadImage('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Beem%20Byte%20full%20logo%20white%403x-AVKzMl1qNGyxFM9voYkJ2Yhj5ycswi.png') // White BeemByte logo
      ]);
      console.log('Images loaded successfully');

      // Draw paint splash effects first
      this.drawPaintSplashes(ctx, canvas.width, canvas.height);

      // Draw main card (100% full)
      this.drawMainCard(ctx, canvas.width, canvas.height);

      // Draw profile elements
      await this.drawProfileElements(ctx, data, profileImg);

      // Draw BeemByte logo
      this.drawBeemByteLogo(ctx, logoImg, canvas.width, canvas.height);

      console.log('Canvas drawing completed');

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${data.firstName}_${data.lastName}_profile_card.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          toast.success('Profile card downloaded successfully!');
          console.log('Profile card download completed');
        } else {
          throw new Error('Failed to create blob from canvas');
        }
      }, 'image/png');

    } catch (error) {
      console.error('Failed to generate profile card:', error);
      toast.error('Failed to generate profile card. Please try again.');
      throw error;
    }
  }

  private static drawPaintSplashes(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Primary color (teal/cyan)
    const primaryColor = 'hsl(174, 78%, 31%)'; // #1B9A8A

    // Cyan splash (left side)
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.7);
    ctx.quadraticCurveTo(width * 0.15, height * 0.5, width * 0.25, height * 0.8);
    ctx.quadraticCurveTo(width * 0.1, height * 0.9, 0, height);
    ctx.closePath();
    ctx.fill();

    // Orange splash (bottom left)
    ctx.fillStyle = '#FF6B35';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.8);
    ctx.quadraticCurveTo(width * 0.2, height * 0.75, width * 0.3, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Pink splash (right side)
    ctx.fillStyle = '#FF1493';
    ctx.beginPath();
    ctx.moveTo(width, height * 0.6);
    ctx.quadraticCurveTo(width * 0.8, height * 0.7, width * 0.75, height * 0.9);
    ctx.quadraticCurveTo(width * 0.9, height * 0.95, width, height);
    ctx.closePath();
    ctx.fill();

    // Add some splash droplets
    const colors = [primaryColor, '#FF6B35', '#FF1493'];
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      const x = Math.random() * width;
      const y = height * 0.7 + Math.random() * height * 0.3;
      const radius = 3 + Math.random() * 8;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private static drawMainCard(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Card fills entire canvas (100% full)
    const cardX = 0;
    const cardY = 0;
    const cardWidth = width;
    const cardHeight = height;

    // Draw main card background with rounded corners
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 20);
    ctx.fill();

    // Draw blue header section using primary color (top 60% of card)
    const headerHeight = cardHeight * 0.6;
    const headerGradient = ctx.createLinearGradient(cardX, cardY, cardX, cardY + headerHeight);
    headerGradient.addColorStop(0, 'hsl(174, 78%, 41%)'); // Lighter primary
    headerGradient.addColorStop(1, 'hsl(174, 78%, 31%)'); // Primary color

    ctx.fillStyle = headerGradient;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, headerHeight, [20, 20, 0, 0]);
    ctx.fill();

    // Store card dimensions for later use
    (ctx as any).cardX = cardX;
    (ctx as any).cardY = cardY;
    (ctx as any).cardWidth = cardWidth;
    (ctx as any).cardHeight = cardHeight;
    (ctx as any).headerHeight = headerHeight;
  }

  private static async drawProfileElements(ctx: CanvasRenderingContext2D, data: ProfileCardData, profileImg: HTMLImageElement) {
    const cardX = (ctx as any).cardX;
    const cardY = (ctx as any).cardY;
    const cardWidth = (ctx as any).cardWidth;
    const cardHeight = (ctx as any).cardHeight;
    const headerHeight = (ctx as any).headerHeight;

    // Draw small profile picture (left side of blue section)
    const smallProfileSize = 100;
    const smallProfileX = 50;
    const smallProfileY = 50;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(smallProfileX, smallProfileY, smallProfileSize, smallProfileSize, 15);
    ctx.clip();
    ctx.drawImage(profileImg, smallProfileX, smallProfileY, smallProfileSize, smallProfileSize);
    ctx.restore();

    // Add border to small profile
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(smallProfileX, smallProfileY, smallProfileSize, smallProfileSize, 15);
    ctx.stroke();

    // Draw main name on blue section - PROPERLY CENTERED AND ALIGNED
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // Position name in the center-left of the blue section
    const nameX = 80;
    const nameY = headerHeight - 100; // Better vertical positioning in blue section
    ctx.fillText(data.firstName, nameX, nameY);

    // Draw job position if available - properly positioned below name
    if (data.jobPosition) {
      ctx.font = '24px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(data.jobPosition, nameX, nameY + 50);
    }

    // Draw "Contact Information" header in white section
    const infoStartY = headerHeight + 40;
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.fillText('Contact Information', 80, infoStartY);

    // Draw contact details with better spacing
    ctx.font = '20px Arial, sans-serif';
    ctx.fillStyle = '#666666';

    let currentY = infoStartY + 40;
    ctx.fillText(data.email, 80, currentY);

    if (data.phoneNumber) {
      currentY += 35;
      ctx.fillText(data.phoneNumber, 80, currentY);
    }

    // Add last name
    if (data.lastName) {
      currentY += 35;
      ctx.font = '18px Arial, sans-serif';
      ctx.fillStyle = '#888888';
      ctx.fillText(data.lastName, 80, currentY);
    }
  }

  private static drawBeemByteLogo(ctx: CanvasRenderingContext2D, logoImg: HTMLImageElement, width: number, height: number) {
    // Draw BeemByte logo in bottom right
    const logoWidth = 150;
    const logoHeight = 75;
    const logoX = width - logoWidth - 40;
    const logoY = height - logoHeight - 40;

    ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
  }

  private static loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        console.log('Image loaded:', src);
        resolve(img);
      };

      img.onerror = (error) => {
        console.error('Failed to load image:', src, error);
        reject(new Error(`Failed to load image: ${src}`));
      };

      img.src = src;
    });
  }
}
