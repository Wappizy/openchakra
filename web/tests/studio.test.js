import {getModels, buildQuery, buildPopulate, buildPopulates, MONGOOSE_OPTIONS} from '../server/utils/database'
import '../server/models/Program'
import '../server/models/Theme'
import '../server/models/Resource'
import '../server/models/Session'
import '../server/models/TrainingCenter'
import '../server/models/TraineeTheme'
import '../server/models/TraineeSession'
import '../server/models/TraineeResource'
import '../server/models/User'

const mongoose=require('mongoose')

describe('Studio models API', () => {

  test('Should return the models names', () => {
    const EXPECTED=new Set(['program', 'theme', 'resource', 'session', 'trainingCenter', 'traineeSession', 'user'])
    const names=getModels().map(d => d.name)
    expect(new Set(names)).toEqual(EXPECTED)
  })

  test('Should return the attributes for program', () => {
    const EXPECTED={
      name: {type: 'String', multiple: false, ref: false},
      code: {type: 'String', multiple: false, ref: false},
      description: {type: 'String', multiple: false, ref: false},
      duration: {type: 'Number', multiple: false, ref: false},
      themes: {type: 'theme', multiple: true, ref: true},
    }
    const program=getModels().find(d => d.name=='program')
    return expect(program.attributes).toEqual(expect.objectContaining(EXPECTED))
  })

  test('Should return the attributes for session', () => {
    const EXPECTED={
      program: {type: 'program', multiple: false, ref: true},
      trainees_count: {type: 'Number', multiple: false, ref: false},
    }
    const session=getModels().find(d => d.name=='session')
    expect(session.attributes).toEqual(expect.objectContaining(EXPECTED))
  })

  test('Should build simple populate', () => {
    const field='themes.resources.name'
    const EXPECTED={path: 'themes', populate: {path: 'resources'}}
    const pop=buildPopulate(field, 'program')
    expect(pop).toEqual(EXPECTED)
    const field2='themes'
    const EXPECTED2={path: 'themes'}
    const pop2=buildPopulate(field2, 'program')
    expect(pop2).toEqual(EXPECTED2)
  })

  test('Should build multiple populates', () => {
    const fields=['themes.resources', 'themes.resources.name']
    const EXPECTED_MULTI=[{path: 'themes', populate: {path: 'resources'}}]
    const pops=buildPopulates(fields, 'program')
    expect(pops).toEqual(EXPECTED_MULTI)
    const fields2=['session.trainers', 'session.trainees']
  })

  test('Should build a query', () => {
    const model='program'
    const id='63402792b7999c87ac1b7073'
    const fields='name,themes,themes.name,themes.resources,themes.resources.url'.split(',')
    const query=buildQuery(model, id, fields)
    return mongoose.connect('mongodb://localhost/aftral_studio', MONGOOSE_OPTIONS)
      .then(() => {
        return query
      })
      .then(data => {
        expect(data[0].themes[0].resources[0].url).toBeTruthy()
      })
  })

  test('Shoud populate virtuals level 1', () => {
    const model='traineeTheme'
    const fields='spent_time'.split(',')
    const query=buildQuery(model, null, fields)
    return mongoose.connect('mongodb://localhost/aftral_studio', MONGOOSE_OPTIONS)
      .then(() => {
        return expect(query._mongooseOptions.populate?.resources).toBeTruthy()
        return query
      })
  })

  test('Shoud populate virtuals level 2', () => {
    const model='traineeSession'
    const fields='spent_time,themes'.split(',')
    const query=buildQuery(model, null, fields)
    return mongoose.connect('mongodb://localhost/aftral_studio', MONGOOSE_OPTIONS)
      .then(() => {
        return expect(query._mongooseOptions?.populate?.themes?.populate?.[0]?.path).toEqual('resources')
        return query
      })
  })

})
