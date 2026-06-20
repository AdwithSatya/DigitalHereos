/**
 * Split calculation utilities
 * All monetary values in floating-point; round to 2dp only for display.
 */

/**
 * @param {Array} people          — [{ id, name, paid }]
 * @param {string} mode           — 'equal' | 'custom' | 'percentage' | 'itemized'
 * @param {Object} data           — personId → value (amount or %)
 * @param {Array}  items          — [{ id, name, amount, assignedTo: [id] }]
 * @param {number} totalAmount
 * @returns {Object}              — personId → amount they owe
 */
export function calculateSplits(people, mode, data, items, totalAmount) {
  const n = people.length;
  if (n === 0) return {};

  switch (mode) {
    case 'equal': {
      const share = totalAmount / n;
      return Object.fromEntries(people.map(p => [p.id, share]));
    }

    case 'custom': {
      return Object.fromEntries(
        people.map(p => [p.id, parseFloat(data[p.id] ?? 0) || 0])
      );
    }

    case 'percentage': {
      return Object.fromEntries(
        people.map(p => [
          p.id,
          ((parseFloat(data[p.id] ?? 0) || 0) / 100) * totalAmount,
        ])
      );
    }

    case 'itemized': {
      const owed = Object.fromEntries(people.map(p => [p.id, 0]));
      for (const item of items) {
        const amt = parseFloat(item.amount) || 0;
        const assigned = (item.assignedTo || []).filter(id =>
          people.some(p => p.id === id)
        );
        if (assigned.length === 0) continue;
        const share = amt / assigned.length;
        for (const pid of assigned) {
          owed[pid] = (owed[pid] || 0) + share;
        }
      }
      return owed;
    }

    default:
      return {};
  }
}

/**
 * Minimize number of transactions to settle all balances.
 * Returns array of { from, to, amount } where from pays to.
 *
 * @param {Array}  people   — [{ id, name, paid }]
 * @param {Object} owed     — personId → amount they should pay
 * @returns {Array}         — [{ from, to, amount }]
 */
export function minimizeTransactions(people, owed) {
  // net[id] = paid - owed; positive = gets money back; negative = owes money
  const net = {};
  for (const p of people) {
    net[p.id] = (parseFloat(p.paid) || 0) - (owed[p.id] || 0);
  }

  const creditors = Object.entries(net)
    .filter(([, v]) => v > 0.005)
    .map(([id, amount]) => ({ id, amount }))
    .sort((a, b) => b.amount - a.amount);

  const debtors = Object.entries(net)
    .filter(([, v]) => v < -0.005)
    .map(([id, amount]) => ({ id, amount: -amount }))
    .sort((a, b) => b.amount - a.amount);

  const creds = creditors.map(c => ({ ...c }));
  const debts = debtors.map(d => ({ ...d }));

  const transactions = [];
  let ci = 0;
  let di = 0;

  while (ci < creds.length && di < debts.length) {
    const amount = Math.min(creds[ci].amount, debts[di].amount);
    transactions.push({
      from: debts[di].id,
      to: creds[ci].id,
      amount: Math.round(amount * 100) / 100,
    });
    creds[ci].amount -= amount;
    debts[di].amount -= amount;
    if (creds[ci].amount < 0.005) ci++;
    if (debts[di].amount < 0.005) di++;
  }

  return transactions;
}

/** Format a number as currency string */
export function fmt(amount) {
  return `₹${Math.abs(amount).toFixed(2)}`;
}

/** Sum an array of numbers */
export function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}
