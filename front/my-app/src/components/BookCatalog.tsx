import { useState, useMemo, useEffect } from 'react';
import type { Book } from '../types';
import { mockBooks } from '../services/mockData';
import { bookApiService } from '../services/bookApiService';
import { BookCard } from './BookCard';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ITEMS_PER_PAGE = 12;

interface BookCatalogProps {
  onViewDetails: (book: Book) => void;
}

export function BookCatalog({ onViewDetails }: BookCatalogProps) {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    bookApiService
      .getAllBooks()
      .then((list) => {
        if (!cancelled) setAllBooks(list);
      })
      .catch(() => {
        if (!cancelled) setAllBooks(mockBooks);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [language]); // Refetch when language changes

  const categories = useMemo(() => {
    const cats = Array.from(new Set(allBooks.map((book) => book.category)));
    return ['all', ...cats];
  }, [allBooks]);

  const filteredAndSortedBooks = useMemo(() => {
    let list = [...allBooks];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (book) =>
          book.name.toLowerCase().includes(q) ||
          book.author.toLowerCase().includes(q) ||
          book.description.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== 'all') {
      list = list.filter((book) => book.category === categoryFilter);
    }
    list.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'author':
          return a.author.localeCompare(b.author);
        default:
          return a.name.localeCompare(b.name);
      }
    });
    return list;
  }, [allBooks, searchQuery, categoryFilter, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedBooks.length / ITEMS_PER_PAGE) || 1;
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedBooks.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedBooks, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, sortBy]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">{t('catalog.title')}</h1>
        <p className="text-gray-600">{t('catalog.search')}</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg border">
        <div className="space-y-2">
          <Label htmlFor="search">{t('common.search')}</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              id="search"
              placeholder={t('catalog.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">{t('book.category')}</Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('catalog.allCategories')}</SelectItem>
              {categories.filter(cat => cat !== 'all').map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sort">{t('catalog.sortBy')}</Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger id="sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">{t('catalog.nameAsc')}</SelectItem>
              <SelectItem value="author">{t('book.author')}</SelectItem>
              <SelectItem value="price-asc">{t('catalog.priceAsc')}</SelectItem>
              <SelectItem value="price-desc">{t('catalog.priceDesc')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            {paginatedBooks.length} {t('common.of')} {filteredAndSortedBooks.length}
          </p>
          {totalPages > 1 && (
            <div className="text-sm text-gray-600">
              {t('book.page')} {currentPage} {t('book.of')} {totalPages}
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">{t('common.loading')}</p>
          </div>
        ) : paginatedBooks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">{t('catalog.noBooksFound')}</p>
            <p className="text-sm mt-2">{t('catalog.tryDifferentSearch')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedBooks.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        )}
      </div>

      {/* Пагінація */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="size-4 mr-1" />
            {t('book.previousPage')}
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className="w-10"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            {t('book.nextPage')}
            <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
