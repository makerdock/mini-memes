import { Footer } from '../../components/footer';
import { Header } from '../../components/header';

export default function TemplateLayout({ children }: { children: React.ReactNode; }) {
    return (
        <main className="min-h-screen bg-gradient-to-b from-purple-600 via-blue-500 to-pink-500 text-white">
            <div className="container mx-auto px-4 ">
                <div className='min-h-screen flex flex-col justify-between'>
                    <Header />
                    {children}
                    <Footer />
                </div>
            </div>
        </main>
    );
} 