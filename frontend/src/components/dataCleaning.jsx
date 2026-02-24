import React, { useMemo, useState } from "react";

function parseCSV(text) {
  // Minimal CSV parser (handles simple CSV; quotes not fully supported)
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const obj = {};
    headers.forEach((h, i) => (obj[h] = cells[i] ?? ""));
    return obj;
  });
  return { headers, rows };
}

function normalizeText(s) {
  return (s ?? "")
    .toString()
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function fingerprintRow(row, headers) {
  // Used for exact duplicate detection (normalized)
  return headers.map((h) => normalizeText(row[h])).join(" | ");
}
