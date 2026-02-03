import { BookOpen } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-white mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="size-5 text-blue-600" />
            <span className="font-semibold">BookStore</span>
          </div>
          <div className="text-sm text-gray-600">
            © {new Date().getFullYear()} BookStore. Усі права захищені.
          </div>
        </div>
      </div>
    </footer>
  );
}
