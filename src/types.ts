/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FieldMapping {
  id: string;
  label: string;
  columnName: string;
  comment: string;
  x: number; // Percent 0-100
  y: number; // Percent 0-100
  width: number;
  height: number;
  page?: number;
}

export interface DocumentState {
  image: string | null;
  mappings: FieldMapping[];
}
