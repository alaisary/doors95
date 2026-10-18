// The visitor's password is on the sticky note. A wrong one is rejected, as the real
// service would, but nobody gets stuck at a booth: after MAX_WRONG misses it is let through.
export const NOTE_PASSWORD = 'CorrectHorseBattery!'
const MAX_WRONG = 3

export function usePasswordCheck() {
  const session = useSessionStore()
  const wrong = ref(0)
  const error = ref(false)

  // true = let the sign-in continue
  function check(entered: string): boolean {
    if (entered === NOTE_PASSWORD) {
      error.value = false
      return true
    }
    wrong.value++
    if (wrong.value >= MAX_WRONG) {
      session.log('PASSWORD_GUESSED', `${wrong.value} wrong passwords, let through so the demo can continue`, 'neutral')
      error.value = false
      return true
    }
    error.value = true
    session.log('WRONG_PASSWORD', 'password did not match', 'neutral')
    if (wrong.value === 2) session.coach('Forgot it? You wrote it down somewhere. Look around your desk.')
    return false
  }

  return { error, check }
}
