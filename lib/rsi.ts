/**
 * RSI-14 using Wilder's smoothing method.
 *
 * @param closes  Close prices in CHRONOLOGICAL order (oldest first).
 * @param period  Lookback period (default 14).
 * @returns The RSI value for the most recent close, or null if there
 *          aren't enough data points (need at least period + 1 closes).
 */
export function computeRsi(closes: number[], period = 14): number | null {
  if (closes.length < period + 1) {
    return null;
  }

  let gainSum = 0;
  let lossSum = 0;

  // Seed the first average gain/loss over the initial `period` deltas.
  for (let i = 1; i <= period; i++) {
    const delta = closes[i] - closes[i - 1];
    if (delta >= 0) {
      gainSum += delta;
    } else {
      lossSum -= delta;
    }
  }

  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;

  // Wilder-smooth across the remaining deltas.
  for (let i = period + 1; i < closes.length; i++) {
    const delta = closes[i] - closes[i - 1];
    const gain = delta >= 0 ? delta : 0;
    const loss = delta < 0 ? -delta : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) {
    return 100;
  }

  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}
