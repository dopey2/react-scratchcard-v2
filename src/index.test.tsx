import { describe, it, expect, vi, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import ScratchCard from "./index";

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    drawImage: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    globalCompositeOperation: "",
  })) as never;
});

describe("ScratchCard", () => {
  it("renders container and canvas", () => {
    const { container } = render(
      <ScratchCard width={300} height={200} image="test.jpg">
        <div>Prize</div>
      </ScratchCard>
    );
    expect(
      container.querySelector(".ScratchCard__Container")
    ).toBeInTheDocument();
    expect(container.querySelector(".ScratchCard__Canvas")).toBeInTheDocument();
  });

  it("renders children", () => {
    const { getByText } = render(
      <ScratchCard width={300} height={200} image="test.jpg">
        <div>You Win!</div>
      </ScratchCard>
    );
    expect(getByText("You Win!")).toBeInTheDocument();
  });
});
