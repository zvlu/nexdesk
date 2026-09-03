import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "./Home";

beforeEach(() => {
  localStorage.clear();
  HTMLElement.prototype.scrollIntoView = vi.fn();
  vi.restoreAllMocks();
  Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => "blob:mock") });
  Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
});

describe("NexDesk revenue dashboard", () => {
  it("renders the hero, dashboard metrics, and initial customer signals", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: /see the signal before it becomes a problem/i })).toBeInTheDocument();
    expect(screen.getAllByText("Net revenue retention")).toHaveLength(2);
    expect(screen.getAllByText("118.4%")).toHaveLength(2);
    expect(screen.getByText("Accounts that deserve a closer look")).toBeInTheDocument();
    expect(screen.getByRole("row", { name: /Arcade Labs/ })).toBeInTheDocument();
    expect(screen.queryByRole("row", { name: /Monument AI/ })).not.toBeInTheDocument();
  });

  it("switches dashboard tabs and revenue timeframes", () => {
    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: "Revenue" }));
    expect(screen.getByRole("heading", { name: "Revenue at a glance" })).toBeInTheDocument();
    expect(screen.getByText("Revenue intelligence")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "90d" }));
    expect(screen.getByRole("button", { name: "90d" })).toHaveClass("selected");
    expect(screen.getAllByRole("img", { name: "Revenue trend chart" })).toHaveLength(2);
  });

  it("filters, searches, sorts, and expands customer accounts", () => {
    render(<Home />);
    const search = screen.getByRole("textbox", { name: "Search customers" });

    fireEvent.click(screen.getByRole("button", { name: /view all accounts/i }));
    fireEvent.change(search, { target: { value: "monument" } });
    expect(screen.getByRole("row", { name: /Monument AI/ })).toBeInTheDocument();
    expect(screen.queryByRole("row", { name: /Arcade Labs/ })).not.toBeInTheDocument();
    expect(screen.getAllByText("monument", { exact: false })[0]).toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox", { name: "Filter by plan" }), { target: { value: "Starter" } });
    expect(screen.getByText("No accounts match that view")).toBeInTheDocument();

    fireEvent.change(search, { target: { value: "" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Sort customers" }), { target: { value: "mrr" } });
    expect(screen.getByRole("row", { name: /Orchard Studio/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /show less/i })).toBeInTheDocument();
  });

  it("opens a customer profile and manages notes", () => {
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: "Open Arcade Labs" }));
    const profile = screen.getByRole("dialog", { name: "Arcade Labs customer profile" });

    expect(within(profile).getByText("Strong account momentum")).toBeInTheDocument();
    expect(within(profile).getByText("Usage momentum increased")).toBeInTheDocument();

    fireEvent.change(within(profile).getByRole("combobox", { name: "Filter activity type" }), { target: { value: "milestone" } });
    expect(within(profile).getByText("Success milestone completed")).toBeInTheDocument();
    expect(within(profile).queryByText("Usage momentum increased")).not.toBeInTheDocument();

    fireEvent.change(within(profile).getByRole("textbox", { name: "Add customer note" }), { target: { value: "Review expansion plan" } });
    fireEvent.click(within(profile).getByRole("button", { name: /save note/i }));
    expect(within(profile).getByText("Review expansion plan")).toBeInTheDocument();
    expect(within(profile).getByText("1 saved")).toBeInTheDocument();

    fireEvent.click(within(profile).getByRole("button", { name: "Edit note 1" }));
    fireEvent.change(within(profile).getByRole("textbox", { name: "Edit note 1" }), { target: { value: "Updated expansion plan" } });
    fireEvent.click(within(profile).getByRole("button", { name: "Save changes" }));
    expect(within(profile).getByText("Updated expansion plan")).toBeInTheDocument();
  });

  it("confirms note deletion and closes the customer profile", () => {
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: /view all accounts/i }));
    fireEvent.click(screen.getByRole("button", { name: "Open Monument AI" }));
    const profile = screen.getByRole("dialog", { name: "Monument AI customer profile" });
    fireEvent.change(within(profile).getByRole("textbox", { name: "Add customer note" }), { target: { value: "Follow up with champion" } });
    fireEvent.click(within(profile).getByRole("button", { name: /save note/i }));
    fireEvent.click(within(profile).getByRole("button", { name: "Delete note 1" }));

    const confirmation = screen.getByRole("alertdialog", { name: "Delete this note?" });
    expect(confirmation).toBeInTheDocument();
    fireEvent.click(within(confirmation).getByRole("button", { name: "Keep note" }));
    expect(within(profile).getByText("Follow up with champion")).toBeInTheDocument();
    fireEvent.click(within(profile).getByRole("button", { name: "Delete note 1" }));
    fireEvent.click(screen.getByRole("alertdialog").querySelector(".confirm-delete") as HTMLElement);
    expect(within(profile).queryByText("Follow up with champion")).not.toBeInTheDocument();

    fireEvent.click(within(profile).getByRole("button", { name: "Close customer profile" }));
    expect(screen.queryByRole("dialog", { name: "Monument AI customer profile" })).not.toBeInTheDocument();
  });

  it("toggles dark mode and persists the preference", () => {
    render(<Home />);
    const toggle = screen.getByRole("button", { name: "Switch to dark mode" });
    fireEvent.click(toggle);

    expect(screen.getByRole("button", { name: "Switch to light mode" })).toBeInTheDocument();
    expect(document.querySelector(".landing-shell")).toHaveClass("theme-dark");
    expect(localStorage.getItem("nexdesk-theme")).toBe("dark");
  });

  it("toggles annual billing and updates plan prices", () => {
    render(<Home />);
    const billing = screen.getByRole("button", { name: "Toggle annual billing" });

    expect(screen.getByText("$29")).toBeInTheDocument();
    fireEvent.click(billing);
    expect(screen.getByText("$39")).toBeInTheDocument();
    expect(screen.getByText("$99")).toBeInTheDocument();
    expect(billing).not.toHaveClass("on");
  });

  it("exports CSV and PDF reports with the selected timeframe and date range", () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: "90d" }));
    fireEvent.change(screen.getByLabelText("Export start date"), { target: { value: "2026-01-01" } });
    fireEvent.change(screen.getByLabelText("Export end date"), { target: { value: "2026-03-31" } });

    fireEvent.click(screen.getByRole("button", { name: /CSV/i }));
    fireEvent.click(screen.getByRole("button", { name: /PDF/i }));

    expect(click).toHaveBeenCalledTimes(2);
    expect(URL.createObjectURL).toHaveBeenCalledTimes(2);
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
  });

  it("rejects an invalid export date range without downloading", () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    render(<Home />);
    fireEvent.change(screen.getByLabelText("Export start date"), { target: { value: "2026-04-01" } });
    fireEvent.change(screen.getByLabelText("Export end date"), { target: { value: "2026-03-01" } });
    fireEvent.click(screen.getByRole("button", { name: /CSV/i }));

    expect(click).not.toHaveBeenCalled();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it("opens and closes the mobile navigation", () => {
    render(<Home />);
    const menu = screen.getByRole("button", { name: "Open navigation" });
    fireEvent.click(menu);
    expect(screen.getByRole("button", { name: "Close navigation" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close navigation" }));
    expect(screen.getByRole("button", { name: "Open navigation" })).toBeInTheDocument();
  });
});
