import type { ComponentType } from "react";
import type { ProductKind } from "../hero.config";
import { Headphones, Speaker } from "./audio";
import { Keyboard, Laptop, Tablet } from "./computing";
import { Earbuds, Phone, Watch } from "./mobile";
import { Controller, Mouse } from "./peripherals";

/** Placeholder model for each product kind. Used whenever the product's GLB file is missing. */
export const PLACEHOLDERS: Record<ProductKind, ComponentType> = {
  laptop: Laptop,
  tablet: Tablet,
  keyboard: Keyboard,
  phone: Phone,
  watch: Watch,
  earbuds: Earbuds,
  headphones: Headphones,
  speaker: Speaker,
  mouse: Mouse,
  controller: Controller,
};
