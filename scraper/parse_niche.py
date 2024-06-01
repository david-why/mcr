#!/usr/bin/env python3

import json
import sys

import requests

FIELDS = [
    # search page
    'latitude',
    'longitude',
    # entity_data
    'name',
    'slug',
    # main page
    'description',
    'website',
    'acceptance_rate',
    'sat_range',
    'act_range',
    'test_requirement',
    'application_website',
    'net_price',
    'student_faculty_ratio',
    'full_time_undergrads',
    'part_time_undergrads',
    'undergrads_over_25',
    'freshman_housing',
    'earnings_after_graduation',
    'graduation_rate',
    'employed_after_graduation',
    # rankings page
    'major_rankings',
    'rankings',
    # admissions page
    'early_decision',
    'early_action',
    # academics page
    'research_funding_per_student',
    'avg_class_size',
    'professor_salary',
]

TEST_REQUIREMENT = {
    'Neither required nor recommended': 0,
    'Considered but not required': 1,
    'Required': 2,
}


def find_school(pages, slug):
    for page in pages:
        for entity in page['entities']:
            if entity['content']['entity']['url'] == slug:
                return entity['content']


def parse_school(data, idx):
    result = {}
    for field in FIELDS:
        result[field] = None
    # entity_data
    result['name'] = data['entity_data']['name']
    result['slug'] = data['entity_data']['url']
    # main page
    for block in data['blocks']:
        if block['config'] is None:
            continue
        anchor = block['config'].get('anchor')
        if anchor == ['editorial']:
            result['description'] = block['buckets']['1']['contents'][0]['value']
        if anchor == ['from-the-school'] and block['buckets']['2']['contents']:
            result['description'] = block['buckets']['2']['contents'][0]['data']
            # print(block['buckets']['2']['contents'][0]['data'])
        if anchor == ['about']:
            for content in block['buckets']['1']['contents']:
                if content.get('label') == 'Website':
                    result['website'] = content['value']
        if anchor == ['admissions']:
            for bucket in block['buckets'].values():
                for content in bucket['contents']:
                    label = content.get('label')
                    if label == 'Acceptance Rate':
                        result['acceptance_rate'] = content['value']
                    if label == 'SAT Range' and content['value']:
                        result['sat_range'] = list(
                            map(int, content['value'].split('-', 2))
                        )
                    if label == 'ACT Range' and content['value']:
                        result['act_range'] = list(
                            map(float, content['value'].split('-', 2))
                        )
                    if label == 'SAT/ACT':
                        result['test_requirement'] = TEST_REQUIREMENT.get(
                            content['value']
                        )
                    if label == 'Application Website':
                        result['application_website'] = content['value']
        if anchor == ['cost']:
            result['net_price'] = block['buckets']['1']['contents'][0]['value']
        if anchor == ['academics']:
            result['student_faculty_ratio'] = block['buckets']['1']['contents'][1][
                'value'
            ]
        if anchor == ['students']:
            result['full_time_undergrads'] = block['buckets']['1']['contents'][0][
                'value'
            ]
            result['part_time_undergrads'] = block['buckets']['1']['contents'][1][
                'value'
            ]
            result['undergrads_over_25'] = block['buckets']['1']['contents'][2]['value']
        if anchor == ['campus-life']:
            result['freshman_housing'] = block['buckets']['1']['contents'][0]['value']
        if anchor == ['after']:
            result['earnings_after_graduation'] = block['buckets']['1']['contents'][0][
                'value'
            ]
            result['graduation_rate'] = block['buckets']['2']['contents'][0]['value']
            result['employed_after_graduation'] = block['buckets']['2']['contents'][1][
                'value'
            ]
    # rankings page
    result['major_rankings'] = {}
    result['rankings'] = {}
    rankings_page = data['rankings']
    for block in rankings_page['blocks']:
        if block['config'] is None:
            continue
        anchor = block['config'].get('anchor')
        if anchor == ['rankings']:
            for group in block['buckets']['1']['contents'][0]['badgeGroups']:
                if group['title'] != 'National':
                    continue
                for badge in group['badges']:
                    key = badge['vanityURL']
                    if key == 'best-colleges':
                        continue
                    if key.startswith('best-colleges-for-'):
                        # key = key[18:].replace('-', ' ').title()
                        # majors.add(key)
                        name = (
                            badge['display']
                            .removeprefix('Best Colleges for ')
                            .removesuffix(' in America')
                        )
                        result['major_rankings'][key] = {
                            'ordinal': badge['ordinal'],
                            'total': badge['total'],
                        }
                        major_rankings[key] = {'total': badge['total'], 'name': name}
                    else:
                        name = badge['display'].removesuffix(' in America')
                        result['rankings'][badge['vanityURL']] = {
                            'ordinal': badge['ordinal'],
                            'total': badge['total'],
                        }
                        rankings[key] = {'total': badge['total'], 'name': name}
    result['rankings']['best-colleges'] = {'total': len(schools), 'ordinal': idx + 1}
    # admissions page
    admissions_page = data['admissions']
    for block in admissions_page['blocks']:
        if block['config'] is None:
            continue
        anchor = block['config'].get('anchor')
        if anchor == ['admissions-deadlines']:
            for bucket in block['buckets'].values():
                for content in bucket['contents']:
                    label = content.get('label')
                    if label == 'Offers Early Decision':
                        result['early_decision'] = content['value']
                    if label == 'Offers Early Action':
                        result['early_action'] = content['value']
    # academics page
    academics_page = data['academics']
    for block in academics_page['blocks']:
        if block['config'] is None:
            continue
        anchor = block['config'].get('anchor')
        if anchor == ['academic-statistics']:
            result['research_funding_per_student'] = block['buckets']['3']['contents'][
                3
            ]['value']
        if anchor == ['about-the-classes']:
            breakdown = block['buckets']['1']['contents'][0]['value']
            if breakdown:
                result['avg_class_size'] = (
                    100 * float(breakdown['100+'])
                    + 70 * float(breakdown['40-99'])
                    + 30 * float(breakdown['20-39'])
                    + 10 * float(breakdown['2-19 students'])
                )
        if anchor == ['about-the-professors']:
            result['professor_salary'] = block['buckets']['1']['contents'][4]['value']
    # search page
    search_content = find_school(pages, result['slug'])
    assert search_content
    result['latitude'] = search_content['centroid']['lat']
    result['longitude'] = search_content['centroid']['lon']
    return result


if len(sys.argv) != 3:
    print('usage: python3 parse_niche.py <niche.json> <output.json>')
    sys.exit(1)

print('loading data')
with open(sys.argv[1], 'r') as f:
    data = json.load(f)
    schools = data['schools']
    pages = data['pages']

result = []
majors = set()
rankings = {'best-colleges': {'total': len(schools), 'name': 'Best Colleges'}}
major_rankings = {}

for i, school in enumerate(schools):
    print('parsing school', i, school['entity_data']['name'])
    result.append(parse_school(school, i))

print('writing data')

output = {
    'schools': result,
    'majors': sorted(majors),
    'rankings': rankings,
    'major_rankings': major_rankings,
}

with open(sys.argv[2], 'w') as f:
    json.dump(output, f, indent=4)
    # json.dump(output, f, separators=(',', ':'))
