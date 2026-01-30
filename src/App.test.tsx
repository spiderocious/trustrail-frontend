import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("App", () => {
  it("renders home page by default", () => {
    renderWithRouter(<App />);
    expect(screen.getByText("Match Maker")).toBeInTheDocument();
    expect(screen.getByText(/Find your perfect match/i)).toBeInTheDocument();
  });

  it("displays feature cards on home page", () => {
    renderWithRouter(<App />);
    expect(screen.getByText("Smart Matching")).toBeInTheDocument();
    expect(screen.getByText("Connect")).toBeInTheDocument();
    expect(screen.getByText("Hot Matches")).toBeInTheDocument();
  });

  it("has navigation links on home page", () => {
    renderWithRouter(<App />);
    expect(screen.getByText("View Matches")).toBeInTheDocument();
    expect(screen.getByText("Learn More")).toBeInTheDocument();
  });
});
