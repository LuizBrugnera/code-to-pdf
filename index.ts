import * as fs from "fs";
import * as path from "path";
import PDFDocument from "pdfkit";

class Generate {
  private static excludedFolders = [
    ".git",
    ".vscode",
    "coverage",
    "bin",
    "out",
    "__pycache__",
    "node_modules",
    ".idea",
    "venv",
    "env",
    ".vs",
    "build",
    "dist",
  ];
  private static excludedFiles = [
    ".gitignore",
    "package-lock.json",
    "tsconfig.json",
    "README.md",
    "output.pdf",
    "*.iml",
    "*.pyc",
    "yarn.lock",
    "*.png",
    "*.jpg",
    "*.jpeg",
    "*.gif",
    "*.bmp",
    "*.ico",
  ];
  private static fileCount = 0;
  private static archiveTypes = new Set<string>();

  private static processDirectory(dir: string, doc: PDFKit.PDFDocument) {
    if (this.excludedFolders.some((folderName) => dir.includes(folderName))) {
      return;
    }

    fs.readdirSync(dir, { withFileTypes: true }).forEach((dirent) => {
      const fullPath = path.join(dir, dirent.name);
      if (dirent.isDirectory()) {
        this.processDirectory(fullPath, doc);
      } else {
        if (this.excludedFiles.includes(dirent.name)) {
          return;
        }

        this.fileCount++;
        this.archiveTypes.add(path.extname(fullPath));

        let fileContent = fs.readFileSync(fullPath, "utf8");
        fileContent = fileContent.replace(/[^\x20-\x7E\n\t]/g, "");

        doc
          .addPage()
          .fontSize(12)
          .text(`Arquivo: ${fullPath}\n\n`, { underline: true })
          .fontSize(10)
          .text(fileContent);
      }
    });
  }

  static GeneratePDF(directory: string, outputFile: string) {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(outputFile));
    this.fileCount = 0;
    this.archiveTypes = new Set<string>();
    this.processDirectory(directory, doc);
    doc
      .addPage()
      .fontSize(16)
      .text(`Content Summary`, { underline: true })
      .moveDown()
      .fontSize(12)
      .text(`Total Files: ${this.fileCount}`)
      .text("\n")
      .text(`Archive Types Found: ${Array.from(this.archiveTypes).join(", ")}`)
      .text("\n")
      .text(`excludedFiles: ${this.excludedFiles.join(", ")}`, {
        underline: true,
      })
      .text("\n")
      .text(`excludedFolders: ${this.excludedFolders.join(", ")}`, {
        underline: true,
      });
    doc.end();
  }
}

const targetDirectoryPath = process.argv[2]; // or "insert/your/directory/here"

if (!targetDirectoryPath) {
  console.log("Por favor, forneça o caminho da pasta.");
  process.exit(1);
}

Generate.GeneratePDF(targetDirectoryPath, "output.pdf");
