// @ts-ignore
import fs from 'fs';
import * as path from 'path';

const EXCLUDED_DIRS = [
  'node_modules',
  '.github',
  '.git',
  '.idea',
  '.nuxt',
  'dist',
  'scripts',
  '.output',
  'Client',
  'Diaes',
  'Designer',
  'assets'
];
const EXCLUDED_FILES = ['package-lock.json', 'project-report.txt', 'README.md', 'LICENSE', '.gitignore'];
const MAX_FILE_SIZE = 1024 * 1024;
const OUTPUT_FILE = 'project-report.txt';

const TEXT_EXTENSIONS = [
  '.ts', '.js', '.jsx', '.tsx', '.vue', '.json', '.md',
  '.txt', '.yml', '.yaml', '.xml', '.html', '.css', '.scss',
  '.less', '.graphql', '.gql', '.env', '.config', '.mjs', '.cjs'
];

interface FileInfo {
  relativePath: string;
  absolutePath: string;
  isDirectory: boolean;
  depth: number;
}

class ProjectReporter {
  private readonly rootDir: string;
  private outputStream: fs.WriteStream;
  private fileCount: number = 0;
  private dirCount: number = 0;

  constructor(rootDir: string = process.cwd()) {
    this.rootDir = rootDir;
    this.outputStream = fs.createWriteStream(
      path.join(this.rootDir, OUTPUT_FILE),
      { encoding: 'utf-8' }
    );
  }

  private shouldExclude(name: string, isDirectory: boolean): boolean {
    if (isDirectory) {
      return EXCLUDED_DIRS.includes(name);
    }
    return EXCLUDED_FILES.includes(name);
  }

  private isTextFile(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return TEXT_EXTENSIONS.includes(ext);
  }

  private scanDirectory(dirPath: string, depth: number = 0): FileInfo[] {
    const files: FileInfo[] = [];

    try {
      const items = fs.readdirSync(dirPath, { withFileTypes: true });

      // Исключаем символические ссылки
      const regularItems = items.filter(item => !item.isSymbolicLink());

      const dirs = regularItems.filter(
        item => item.isDirectory() && !this.shouldExclude(item.name, true)
      );
      const fileItems = regularItems.filter(
        item => !item.isDirectory() && !this.shouldExclude(item.name, false)
      );

      dirs.sort((a, b) => a.name.localeCompare(b.name));
      fileItems.sort((a, b) => a.name.localeCompare(b.name));

      for (const dir of dirs) {
        const fullPath = path.join(dirPath, dir.name);
        const relativePath = path.relative(this.rootDir, fullPath);
        files.push({
          relativePath,
          absolutePath: fullPath,
          isDirectory: true,
          depth
        });
        files.push(...this.scanDirectory(fullPath, depth + 1));
      }

      for (const file of fileItems) {
        const fullPath = path.join(dirPath, file.name);
        const relativePath = path.relative(this.rootDir, fullPath);
        files.push({
          relativePath,
          absolutePath: fullPath,
          isDirectory: false,
          depth
        });
      }
    } catch (error) {
      console.error(`Ошибка при сканировании ${dirPath}:`, error);
    }

    return files;
  }

  private generateTreeStructure(files: FileInfo[]): string {
    // Сбрасываем счётчики перед построением
    this.fileCount = 0;
    this.dirCount = 0;

    let tree = "📁 СТРУКТУРА ПРОЕКТА:\n";
    tree += "=".repeat(50) + "\n\n";

    // Используем порядок из scanDirectory (без дополнительной сортировки)
    const sorted = files;

    for (let i = 0; i < sorted.length; i++) {
      const file = sorted[i];
      const isLastOnLevel = this.isLastChildOnLevel(sorted, i);

      let prefix = "";
      for (let d = 0; d < file.depth; d++) {
        const parentIsLast = this.isParentLastOnLevel(sorted, i, d);
        prefix += parentIsLast ? "    " : "│   ";
      }

      const connector = isLastOnLevel ? "└── " : "├── ";
      const icon = file.isDirectory ? "📁 " : "📄 ";

      tree += `${prefix}${connector}${icon}${path.basename(file.relativePath)}\n`;

      if (file.isDirectory) this.dirCount++;
      else this.fileCount++;
    }

    tree += `\n${"=".repeat(50)}\n`;
    tree += `📊 Статистика: ${this.dirCount} папок, ${this.fileCount} файлов\n\n`;

    return tree;
  }

  private isLastChildOnLevel(files: FileInfo[], currentIndex: number): boolean {
    const current = files[currentIndex];
    for (let i = currentIndex + 1; i < files.length; i++) {
      if (files[i].depth === current.depth) {
        return false;
      }
      if (files[i].depth < current.depth) {
        break;
      }
    }
    return true;
  }

  private isParentLastOnLevel(files: FileInfo[], currentIndex: number, targetDepth: number): boolean {
    for (let i = currentIndex; i >= 0; i--) {
      if (files[i].depth === targetDepth && files[i].isDirectory) {
        return this.isLastChildOnLevel(files, i);
      }
    }
    return false;
  }

  private getFileContent(filePath: string): string {
    try {
      const stats = fs.statSync(filePath);
      if (stats.size > MAX_FILE_SIZE) {
        return `[Файл слишком большой для отображения: ${stats.size} байт]`;
      }
      if (!this.isTextFile(filePath)) {
        return `[Бинарный файл: ${stats.size} байт]`;
      }
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      return `[Ошибка чтения файла: ${error}]`;
    }
  }

  private generateFileContents(files: FileInfo[]): string {
    let contents = "📄 СОДЕРЖИМОЕ ФАЙЛОВ:\n";
    contents += "=".repeat(50) + "\n\n";

    const fileList = files.filter(f => !f.isDirectory);
    for (const file of fileList) {
      contents += `\n${"=".repeat(40)}\n`;
      contents += `ФАЙЛ: ${file.relativePath}\n`;
      contents += `${"=".repeat(40)}\n\n`;
      contents += this.getFileContent(file.absolutePath) + "\n";
    }
    return contents;
  }

  public async generateReport(): Promise<void> {
    console.log(`🔍 Сканирование проекта: ${this.rootDir}`);
    const startTime = Date.now();
    const allFiles = this.scanDirectory(this.rootDir);

    console.log(`📊 Найдено: ${allFiles.filter(f => f.isDirectory).length} папок, ${allFiles.filter(f => !f.isDirectory).length} файлов`);

    this.outputStream = fs.createWriteStream(
      path.join(this.rootDir, OUTPUT_FILE),
      { encoding: 'utf-8', flags: 'w' }
    );

    this.outputStream.write(this.generateTreeStructure(allFiles));
    this.outputStream.write(this.generateFileContents(allFiles));

    const endTime = Date.now();
    const meta = `\n${"=".repeat(50)}\n` +
      `Отчет сгенерирован: ${new Date().toLocaleString()}\n` +
      `Время генерации: ${((endTime - startTime) / 1000).toFixed(2)} сек.\n`;

    this.outputStream.write(meta);
    this.outputStream.end();

    return new Promise((resolve, reject) => {
      this.outputStream.on('finish', () => {
        console.log(`✅ Отчет сохранен в: ${OUTPUT_FILE}`);
        resolve();
      });
      this.outputStream.on('error', reject);
    });
  }
}

const reporter = new ProjectReporter();
reporter.generateReport()
  .then(() => {
    console.log('🎉 Генерация отчета завершена!');
    process.exit(0);
  })
  .catch((error: Error) => {
    console.error('❌ Ошибка генерации отчета:', error);
    process.exit(1);
  });
