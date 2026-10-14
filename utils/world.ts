// The fictional world the booth is set in: one company, its people and its look-alikes.
// Oman's work week runs Sunday to Thursday, so deadlines fall on Thursday and meetings on Sunday.
// All names are invented; check that a company name is not a real firm before printing it anywhere.
export const WORLD = {
  company: 'Wadi Gate Logistics',
  realDomain: 'wadigate.om',          // the real one ends in .om
  attackerDomain: 'wadigate-portal.com', // look-alikes end in .com
  currency: 'OMR',                    // three decimals: OMR 5,490.000
  host: 'WG-LT-0441',
  visitorFirst: 'Salim',
  visitorFull: 'Salim Al Harthi',
  visitorUser: 's.alharthi',
  colleague: 'Hamad Al Busaidi',
  coworker: 'Dana Al Kindi',
} as const
