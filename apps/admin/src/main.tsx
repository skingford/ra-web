import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "@/components/ui/provider";
import "./styles/index.scss";
import AppRouter from './routes'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider defaultTheme="system" enableSystem>
      <AppRouter />
    </Provider>
  </StrictMode>
);
