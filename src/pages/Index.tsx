import { Header } from "@/components/factory/Header";
import { ProgressBar } from "@/components/factory/ProgressBar";
import { MainGrid } from "@/components/factory/MainGrid";
import { ValidationMap } from "@/components/factory/ValidationMap";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ProgressBar />
      <MainGrid />
      <ValidationMap />
      
      <footer className="border-t dotted-border-t py-6 mt-12">
        <p className="text-center text-sm text-muted-foreground">
          © 2025 AI Marketing Factory. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
};

export default Index;
