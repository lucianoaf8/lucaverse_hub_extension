/**
 * TypeScript utility types for enhanced type safety and convenience
 */

// Branded types for IDs to prevent mixing different ID types
declare const __brand: unique symbol;
type Brand<T, TBrand> = T & { [__brand]: TBrand };

export type PanelId = Brand<string, 'PanelId'>;
export type WorkspaceId = Brand<string, 'WorkspaceId'>;
export type NotificationId = Brand<string, 'NotificationId'>;
export type WindowId = Brand<string, 'WindowId'>;

// Utility to create branded IDs
export const createPanelId = (id: string): PanelId => id as PanelId;
export const createWorkspaceId = (id: string): WorkspaceId => id as WorkspaceId;
export const createNotificationId = (id: string): NotificationId => id as NotificationId;
export const createWindowId = (id: string): WindowId => id as WindowId;

// Utility types for partial updates
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Utility type for making nested properties optional
export type DeepOptional<T> = {
  [P in keyof T]?: T[P] extends object ? DeepOptional<T[P]> : T[P];
};

// Discriminated unions for different panel states
export type PanelStateType =
  | { type: 'idle'; data: null }
  | { type: 'dragging'; data: { startPosition: Position; currentPosition: Position } }
  | { type: 'resizing'; data: { direction: ResizeDirection; startSize: Size; currentSize: Size } }
  | { type: 'focused'; data: { focusedAt: number } }
  | { type: 'error'; data: { message: string; code?: string } };

// Action result types
export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

// API response wrapper
export type APIResponse<T = unknown> =
  | { status: 'success'; data: T }
  | { status: 'error'; error: string; details?: unknown }
  | { status: 'loading' };

// Event handler result types
export type EventHandlerResult = void | Promise<void>;

// Callback types
export type Callback<T = void> = (arg: T) => void;
export type AsyncCallback<T = void> = (arg: T) => Promise<void>;
export type UnsubscribeFn = () => void;

// Validation types
export type ValidationResult = { valid: true } | { valid: false; errors: ValidationError[] };

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// Configuration types
export type ConfigValue = string | number | boolean | object | null;
export type ConfigObject = Record<string, ConfigValue>;

// Utility for extracting array element type
export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

// Utility for extracting promise return type
export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

// Utility for making specific properties required
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

// Utility for making specific properties optional
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Utility for extracting function parameters
export type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any
  ? P
  : never;

// Utility for extracting function return type
export type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R
  ? R
  : any;

// Type guard utilities
export type TypeGuard<T> = (value: unknown) => value is T;

// Mutable utility (removes readonly modifiers)
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P] extends readonly (infer U)[] ? U[] : T[P];
};

// Immutable utility (adds readonly modifiers)
export type Immutable<T> = {
  readonly [P in keyof T]: T[P] extends (infer U)[] ? readonly U[] : T[P];
};

// Nominal typing for better type safety
export type Nominal<T, K> = T & { __nominal: K };

import { Position, Size } from './panel';
import { ResizeDirection } from './layout';
