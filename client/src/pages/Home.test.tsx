import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import Home from "./Home";

beforeEach(() => {
  localStorage.clear();
});

describe("NexDesk dashboard", () => {
  it("seeds the queue and calculates the overview metrics", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: /good morning, jordan/i })).toBeInTheDocument();
    expect(screen.getByText("Open tickets")).toBeInTheDocument();
    expect(screen.getByText("Laptop won't power on")).toBeInTheDocument();
    expect(screen.getByText("VPN access for new hire")).toBeInTheDocument();
    expect(screen.getByText("Synced just now")).toBeInTheDocument();
  });

  it("filters tickets by search term and status", () => {
    render(<Home />);
    const search = screen.getByRole("textbox", { name: /search tickets/i });
    fireEvent.change(search, { target: { value: "vpn" } });

    expect(screen.getByText("VPN access for new hire")).toBeInTheDocument();
    expect(screen.queryByText("Laptop won't power on")).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox", { name: /filter by status/i }), { target: { value: "Open" } });
    expect(screen.getByText("No tickets match that view")).toBeInTheDocument();
  });

  it("creates a new ticket and persists it to localStorage", () => {
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: /^create ticket$/i }));
    const dialog = screen.getByRole("dialog", { name: /create a ticket/i });

    fireEvent.change(within(dialog).getByPlaceholderText("e.g. Laptop won't power on"), { target: { value: "New monitor needed" } });
    fireEvent.change(within(dialog).getByPlaceholderText(/what is happening/i), { target: { value: "A second monitor is needed for the support pod." } });
    fireEvent.change(within(dialog).getByPlaceholderText("Name or team"), { target: { value: "Workplace team" } });
    fireEvent.click(within(dialog).getByRole("button", { name: /^create ticket$/i }));

    expect(screen.getByRole("row", { name: /New monitor needed/ })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("nexdesk-tickets") || "[]")).toEqual(expect.arrayContaining([expect.objectContaining({ title: "New monitor needed", status: "Open" })]));
  });

  it("records a status change in the ticket activity history", () => {
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: /open NX-1042/i }));
    const drawer = screen.getByRole("dialog", { name: /ticket details/i });

    fireEvent.change(within(drawer).getByRole("combobox"), { target: { value: "In Progress" } });

    expect(within(drawer).getByText("Status changed to In Progress")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("nexdesk-tickets") || "[]")).toEqual(expect.arrayContaining([expect.objectContaining({ id: "NX-1042", status: "In Progress", activity: expect.arrayContaining([expect.objectContaining({ text: "Status changed to In Progress" })]) })]));
  });

  it("opens the team workspace and exposes capacity details", () => {
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: "Team" }));

    expect(screen.getByRole("heading", { name: "Your service team" })).toBeInTheDocument();
    expect(screen.getByText("Agents on duty")).toBeInTheDocument();
    expect(screen.getAllByText((_content, element) => element?.textContent?.includes("Rebalance") ?? false).length).toBeGreaterThan(0);
  });

  it("opens knowledge base and settings panels", () => {
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: "Knowledge base" }));
    expect(screen.getByRole("heading", { name: "Knowledge base" })).toBeInTheDocument();
    expect(screen.getByText("VPN access for new hires")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    expect(screen.getByRole("heading", { name: "Workspace settings" })).toBeInTheDocument();
    const toggle = screen.getByRole("button", { name: "Toggle ticket updates" });
    expect(toggle).toHaveClass("on");
    fireEvent.click(toggle);
    expect(toggle).not.toHaveClass("on");
  });
});
