import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF;
  }

  interface AutoTableOptions {
    head?: any[][];
    body?: any[][];
    startY?: number;
    margin?: { top?: number; bottom?: number; left?: number; right?: number };
    theme?: 'striped' | 'grid' | 'plain';
    styles?: {
      font?: string;
      fontStyle?: string;
      overflow?: 'linebreak' | 'ellipsize' | 'visible' | 'hidden';
      fillColor?: number | number[];
      textColor?: number | number[];
      fontSize?: number;
      halign?: 'left' | 'center' | 'right';
      valign?: 'top' | 'middle' | 'bottom';
      cellPadding?: number;
      lineWidth?: number;
      lineColor?: number | number[];
      cellWidth?: 'auto' | 'wrap' | number;
      minCellHeight?: number;
      rowPageBreak?: 'auto' | 'avoid';
    };
    headStyles?: {
      fillColor?: number | number[];
      textColor?: number | number[];
      fontStyle?: string;
      halign?: 'left' | 'center' | 'right';
      valign?: 'top' | 'middle' | 'bottom';
    };
    bodyStyles?: {
      fillColor?: number | number[];
      textColor?: number | number[];
      fontStyle?: string;
      halign?: 'left' | 'center' | 'right';
      valign?: 'top' | 'middle' | 'bottom';
    };
    columnStyles?: {
      [key: number]: {
        cellWidth?: 'auto' | 'wrap' | number;
        halign?: 'left' | 'center' | 'right';
        valign?: 'top' | 'middle' | 'bottom';
        fontStyle?: string;
        overflow?: 'linebreak' | 'ellipsize' | 'visible' | 'hidden';
        textColor?: number | number[];
        fillColor?: number | number[];
      };
    };
    didDrawCell?: (data: any) => void;
    didParseCell?: (data: any) => void;
    willDrawCell?: (data: any) => void;
    didDrawPage?: (data: any) => void;
    useCss?: boolean;
    pageBreak?: 'auto' | 'avoid';
    rowPageBreaks?: boolean;
    tableWidth?: 'auto' | 'wrap' | number;
    showHead?: 'everyPage' | 'firstPage' | 'never';
    showFoot?: 'everyPage' | 'lastPage' | 'never';
    tableLineWidth?: number;
    tableLineColor?: number | number[];
  }
}
