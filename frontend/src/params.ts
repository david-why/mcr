/**
 * This file lists all the possible parameters that the user can choose to
 * rank colleges. Each parameter adheres to the interface `Parameter`. The
 * `func` field takes a school and the arguments and returns a number
 * between 0 and 1, where 0 is the worst and 1 is the best.
 *
 * When users add a parameter to their ranking, they add a `UserParameter`
 * object to the `userParams` array in `src/store.ts`. This object has the
 * same `id` as the parameter and a dictionary of arguments. The arguments
 * are keyed by the `id` of the argument, and the value is a number between
 * the `min` and `max` values of the argument.
 */

import data from '@/assets/data.json'
import type { School } from '@/types'

export declare interface Parameter {
  id: string
  name: string
  code: string
  group: string
  arguments: {
    id: string
    name: string
    min: number
    max: number
    step: number
    default?: number
  }[]
  func: (school: School, args: any) => number
}

export declare interface UserParameter {
  id: string
  importance: number // 0 to 100
  args: { [id: string]: number }
}

declare type SchoolNumberKey = {
  [K in keyof School]: School[K] extends number ? K : never
}[keyof School]

const cachedRange: Record<SchoolNumberKey, [number, number]> = {} as any

function getRange(key: SchoolNumberKey) {
  if (cachedRange[key]) {
    return cachedRange[key]
  }
  const min = Math.min(...data.schools.map((school) => school[key]))
  const max = Math.max(...data.schools.map((school) => school[key]))
  return cachedRange[key] = [min, max]
}

function normalizeValue(value: number, key: SchoolNumberKey) {
  const [min, max] = getRange(key)
  if (value > max) return 1
  if (value < min) return 0
  return (value - min) / (max - min)
}

// Niche ranking
function rankingParam(id: keyof typeof data.meta.rankings, name: string, code: string): Parameter {
  return {
    id,
    name,
    code,
    group: 'Rankings',
    arguments: [],
    func: (school: School) => {
      const ranking = school.rankings[id]
      if (ranking === undefined) return 0
      const ordinal = ranking.ordinal
      // If a school is >100 in a ranking, it's as good as not ranked
      if (ordinal > 100) return 0
      return 1 - (ordinal - 1) / 100
    }
  }
}

// Niche major ranking
function majorRankingParam(id: keyof typeof data.meta.major_rankings, code: string): Parameter {
  const name = data.meta.major_rankings[id].name
  return {
    id,
    name,
    code,
    group: 'Majors',
    arguments: [],
    func: (school: School) => {
      const ranking = school.major_rankings[id]
      if (ranking === undefined) return 0
      const ordinal = ranking.ordinal
      // If a school is >100 in a ranking, it's as good as not ranked
      if (ordinal > 100) return 0
      return 1 - (ordinal - 1) / 100
    }
  }
}

const params: Parameter[] = [
  { ...rankingParam('best-colleges', 'Niche Overall Rank', 'ov'), group: 'General' },
  {
    id: 'northern',
    name: 'Northern schools',
    code: 'no',
    group: 'General',
    arguments: [],
    func: (school: School) => {
      return normalizeValue(school.latitude, 'latitude')
    }
  },
  {
    id: 'southern',
    name: 'Southern schools',
    code: 'so',
    group: 'General',
    arguments: [],
    func: (school: School) => {
      return 1 - normalizeValue(school.latitude, 'latitude')
    }
  },
  {
    id: 'eastern',
    name: 'Eastern schools',
    code: 'ea',
    group: 'General',
    arguments: [],
    func: (school: School) => {
      return normalizeValue(school.longitude, 'longitude')
    }
  },
  {
    id: 'western',
    name: 'Western schools',
    code: 'we',
    group: 'General',
    arguments: [],
    func: (school: School) => {
      return 1 - normalizeValue(school.longitude, 'longitude')
    }
  },
  {
    id: 'sat-range',
    name: 'SAT score',
    code: 'st',
    group: 'General',
    arguments: [{ id: 'sat', name: 'SAT Score', min: 400, max: 1600, step: 10, default: 1000 }],
    func: (school: School, { sat }: { sat: number }) => {
      const satRange = school.sat_range
      if (satRange === null) return 1
      const [min, max] = satRange
      if (sat > max) return 1
      if (sat < min) return 0
      return (sat - min) / (max - min)
    }
  },
  {
    id: 'net-price',
    name: 'Low net price',
    code: 'np',
    group: 'General',
    arguments: [],
    func: (school: School) => {
      return 1 - normalizeValue(school.net_price, 'net_price')
    }
  },
  {
    id: 'large',
    name: 'Large schools',
    code: 'la',
    group: 'General',
    arguments: [],
    func: (school: School) => {
      return normalizeValue(school.full_time_undergrads, 'full_time_undergrads')
    }
  },
  {
    id: 'small',
    name: 'Small schools',
    code: 'sm',
    group: 'General',
    arguments: [],
    func: (school: School) => {
      return 1 - normalizeValue(school.full_time_undergrads, 'full_time_undergrads')
    }
  },
  {
    id: 'student-faculty-ratio',
    name: 'Low student-faculty ratio',
    code: 'sf',
    group: 'General',
    arguments: [],
    func: (school: School) => {
      return 1 - normalizeValue(school.student_faculty_ratio, 'student_faculty_ratio')
    }
  },
  {
    id: 'high-acceptance-rate',
    name: 'High acceptance rate',
    code: 'hc',
    group: 'General',
    arguments: [],
    func: (school: School) => {
      return normalizeValue(school.acceptance_rate, 'acceptance_rate')
    }
  },
  {
    id: 'low-acceptance-rate',
    name: 'Low acceptance rate',
    code: 'lc',
    group: 'General',
    arguments: [],
    func: (school: School) => {
      return 1 - normalizeValue(school.acceptance_rate, 'acceptance_rate')
    }
  },
  {
    id: 'earnings',
    name: 'High earnings after school',
    code: 'en',
    group: 'General',
    arguments: [],
    func: (school: School) => {
      return normalizeValue(school.earnings_after_graduation, 'earnings_after_graduation')
    }
  },
  {
    id: 'employment',
    name: 'High employment after school',
    code: 'em',
    group: 'General',
    arguments: [],
    func: (school: School) => {
      return normalizeValue(school.employed_after_graduation, 'employed_after_graduation')
    }
  },
  rankingParam('best-college-academics', 'Best Academics', 'ac'),
  rankingParam('best-college-athletics', 'Best Athletics', 'at'),
  rankingParam('best-college-campuses', 'Best Campuses', 'ca'),
  rankingParam('best-college-dorms', 'Best Dorms', 'do'),
  rankingParam('best-college-food', 'Best Food', 'fo'),
  rankingParam('best-greek-life-colleges', 'Best Greek Life', 'gl'),
  rankingParam('best-college-professors', 'Best Professors', 'pr'),
  rankingParam('best-student-life', 'Best Student Life', 'sl'),
  rankingParam('most-conservative-colleges', 'Most Conservative', 'co'),
  rankingParam('most-liberal-colleges', 'Most Liberal', 'li'),
  rankingParam('top-party-schools', 'Top Party Schools', 'pa'),
  majorRankingParam('best-colleges-for-accounting', 'ao'),
  majorRankingParam('best-colleges-for-agricultural-sciences', 'ag'),
  majorRankingParam('best-colleges-for-anthropology', 'an'),
  majorRankingParam('best-colleges-for-architecture', 'ah'),
  majorRankingParam('best-colleges-for-art', 'ar'),
  majorRankingParam('best-colleges-for-biology', 'bi'),
  majorRankingParam('best-colleges-for-business', 'bu'),
  majorRankingParam('best-colleges-for-chemistry', 'cm'),
  majorRankingParam('best-colleges-for-communications', 'cu'),
  majorRankingParam('best-colleges-for-computer-science', 'cs'),
  majorRankingParam('best-colleges-for-criminal-justice', 'cr'),
  majorRankingParam('best-colleges-for-culinary-arts', 'cl'),
  majorRankingParam('best-colleges-for-design', 'de'),
  majorRankingParam('best-colleges-for-economics', 'ec'),
  majorRankingParam('best-colleges-for-education', 'ed'),
  majorRankingParam('best-colleges-for-engineering', 'ei'),
  majorRankingParam('best-colleges-for-english', 'eg'),
  majorRankingParam('best-colleges-for-environmental-science', 'es'),
  majorRankingParam('best-colleges-for-film', 'fi'),
  majorRankingParam('best-colleges-for-global-studies', 'gs'),
  majorRankingParam('best-colleges-for-history', 'hi'),
  majorRankingParam('best-colleges-for-information-technology', 'it'),
  majorRankingParam('best-colleges-for-international-relations', 'in'),
  majorRankingParam('best-colleges-for-physical-therapy', 'ki'),
  majorRankingParam('best-colleges-for-math', 'ma'),
  majorRankingParam('best-colleges-for-music', 'mu'),
  majorRankingParam('best-colleges-for-nursing', 'nu'),
  majorRankingParam('best-colleges-for-theater', 'pe'),
  majorRankingParam('best-colleges-for-philosophy', 'ph'),
  majorRankingParam('best-colleges-for-physics', 'py'),
  majorRankingParam('best-colleges-for-political-science', 'po'),
  majorRankingParam('best-colleges-for-psychology', 'ps'),
  majorRankingParam('best-colleges-for-public-health', 'pu'),
  majorRankingParam('best-colleges-for-public-policy', 'pp'),
  majorRankingParam('best-colleges-for-religious-studies', 're'),
  majorRankingParam('best-colleges-for-sports-management', 'sp')
]

export default params

export function dumpHash(userParams: UserParameter[]) {
  let hash = ''
  for (const userParam of userParams) {
    const param = params.find((p) => p.id === userParam.id)!
    hash += param.code + userParam.importance.toString(36)
    for (const arg of param.arguments) {
      hash += ',' + userParam.args[arg.id].toString(36)
    }
    hash += ';'
  }
  return hash.slice(0, -1)
}

export function loadHash(hash: string) {
  if (!hash) {
    return []
  }
  try {
    const parts = hash.split(';')
    const newParams: UserParameter[] = []
    for (const part of parts) {
      const [part1, ...args] = part.split(',')
      const code = part1.slice(0, 2)
      const importance = part1.slice(2)
      const param = params.find((p) => p.code === code)!
      const newArgs: Record<string, number> = {}
      for (let i = 0; i < param.arguments.length; i++) {
        newArgs[param.arguments[i].id] = parseInt(args[i], 36)
      }
      newParams.push({ id: param.id, importance: parseInt(importance, 36), args: newArgs })
    }
    return newParams
  } catch (e) {
    console.error('Error parsing hash:', e)
    return []
  }
}
