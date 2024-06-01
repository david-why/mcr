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

// Niche ranking
function rankingParam(id: keyof typeof data.rankings, name?: string): Parameter {
  const defaultName = data.rankings[id].name
  return {
    id,
    name: name === undefined ? defaultName : name,
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
function majorRankingParam(id: keyof typeof data.major_rankings): Parameter {
  const name = data.major_rankings[id].name
  return {
    id,
    name,
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
  {
    id: 'sat-range',
    name: 'SAT Score',
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
  rankingParam('best-colleges', 'Niche Overall Rank'),
  rankingParam('best-college-academics', 'Best Academics'),
  rankingParam('best-college-athletics', 'Best Athletics'),
  rankingParam('best-college-campuses', 'Best Campuses'),
  rankingParam('best-college-dorms', 'Best Dorms'),
  rankingParam('best-college-food', 'Best Food'),
  rankingParam('best-greek-life-colleges', 'Best Greek Life'),
  rankingParam('best-college-professors', 'Best Professors'),
  rankingParam('best-student-life', 'Best Student Life'),
  rankingParam('most-conservative-colleges', 'Most Conservative'),
  rankingParam('most-liberal-colleges', 'Most Liberal'),
  rankingParam('safest-colleges', 'Most Safe'),
  rankingParam('top-party-schools', 'Top Party Schools')
]

for (const id of Object.keys(data.major_rankings).sort((a, b) => a.localeCompare(b))) {
  params.push(majorRankingParam(id as keyof typeof data.major_rankings))
}

export default params
