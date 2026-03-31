import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  PageOrientation,
  AlignmentType,
  HeadingLevel,
  ImageRun,
  TabStopType,
} from 'docx';
import { saveAs } from 'file-saver';
import { ProgramData } from './types';

const getImageDimensions = (dataUrl: string): Promise<{width: number, height: number}> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.src = dataUrl;
  });
};

export const exportToWord = async (data: ProgramData) => {
  const children: any[] = [];

  // Add Logo if exists
  if (data.logo) {
    try {
      const dimensions = await getImageDimensions(data.logo);
      // Scale logo to a reasonable width while maintaining aspect ratio
      const targetWidth = 200;
      const targetHeight = (dimensions.height / dimensions.width) * targetWidth;

      const base64Data = data.logo.split(',')[1];
      const mimeType = data.logo.substring(data.logo.indexOf('/') + 1, data.logo.indexOf(';'));
      
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: bytes,
              transformation: {
                width: targetWidth,
                height: targetHeight,
              },
              type: mimeType === 'jpeg' ? 'jpg' : mimeType as any,
            }),
          ],
        })
      );
    } catch (e) {
      console.error('Error adding logo to Word doc:', e);
    }
  }

  // Header
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 200 },
      children: [
        new TextRun({
          text: data.title,
          size: Math.round(48 * (data.titleFontSizeScale ?? 1)), // 24pt base
        }),
      ],
    }),
    new Paragraph({
      text: data.subtitle,
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: `${data.date}${data.time ? ` | ${data.time}` : ''}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: data.location,
      alignment: AlignmentType.CENTER,
      spacing: { after: Math.round((data.headerSpacing ?? 1.5) * 266 * (data.fontSizeScale || 1)) },
    })
  );

  const scale = data.fontSizeScale || 1;

  // Performers
  data.performers.forEach((performer) => {
    children.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: Math.round(100 * scale), after: Math.round(100 * scale) },
        tabStops: [
          {
            type: TabStopType.RIGHT,
            position: data.layout === 'folded' ? 6840 : 14400, // 6840 twips = 4.75 inches (half page col), 14400 = 10 inches (full page)
            leader: "dot" as any,
          },
        ],
        children: [
          new TextRun({
            text: performer.name,
            bold: true,
            size: Math.round(22 * scale), // 11pt base
          }),
          new TextRun({
            text: "\t",
          }),
          new TextRun({
            text: performer.piece,
            italics: true,
            size: Math.round(22 * scale), // 11pt base
          }),
        ],
      })
    );
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.LANDSCAPE,
            },
            margin: {
              top: 720, // 0.5 inch
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
          column: {
            space: 720, // 0.5 inch between columns
            count: data.layout === 'folded' ? 2 : 1,
          },
        },
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${data.title.replace(/\s+/g, '_')}_Program.docx`);
};
