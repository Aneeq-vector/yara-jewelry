import PageWrapper from '@/components/layout/PageWrapper';
import Hero from '@/components/home/Hero';
import FeaturedCollections from '@/components/home/FeaturedCollections';
import TrendingProducts from '@/components/home/TrendingProducts';
import WhyChooseYara from '@/components/home/WhyChooseYara';
import FashionInspiration from '@/components/home/FashionInspiration';
import Testimonials from '@/components/home/Testimonials';
import InstagramShowcase from '@/components/home/InstagramShowcase';
import { getTrendingProducts } from '@/lib/data/products';
import { getAllCategories } from '@/lib/data/categories';
import { getAllTestimonials } from '@/lib/data/testimonials';

export default async function HomePage() {
  const [trendingProducts, categories, testimonials] = await Promise.all([
    getTrendingProducts(),
    getAllCategories(),
    getAllTestimonials(),
  ]);

  return (
    <PageWrapper>
      <Hero />
      <FeaturedCollections categories={categories} />
      <TrendingProducts products={trendingProducts} />
      <WhyChooseYara />
      <FashionInspiration />
      <Testimonials testimonials={testimonials} />
      <InstagramShowcase />
    </PageWrapper>
  );
}
