import { useState, useEffect } from 'react';
import type { Book } from '../types';
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
  const [totalPages, setTotalPages] = useState(1);
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>(['all']);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genres = await bookApiService.getGenres();
        setCategories(['all', ...genres]);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        // Map frontend sort names to backend field names
        const sortMap: Record<string, string> = {
          'name': 'name,asc',
          'author': 'author,asc',
          'price-asc': 'price,asc',
          'price-desc': 'price,desc'
        };

        const data = await bookApiService.searchBooks({
          keyword: searchQuery,
          genre: categoryFilter === 'all' ? undefined : categoryFilter,
          page: currentPage - 1,
          size: ITEMS_PER_PAGE,
          sort: sortMap[sortBy] || 'name,asc'
        });

        setBooks(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalPages * ITEMS_PER_PAGE); // We don't have totalElements in searchBooks response, but that's okay for now
      } catch (error) {
        console.error('Error loading books:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBooks();
  }, [searchQuery, categoryFilter, sortBy, currentPage, language]);

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
            {t('manageBooks.showing', { current: books.length, total: totalElements })}
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
        ) : books.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">{t('catalog.noBooksFound')}</p>
            <p className="text-sm mt-2">{t('catalog.tryDifferentSearch')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
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
