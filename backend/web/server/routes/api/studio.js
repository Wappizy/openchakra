const child_process = require('child_process')
const fs=require('fs').promises
const path=require('path')
const express = require('express')
const mongoose=require('mongoose')
const passport = require('passport')
const url = require("url")
const bcrypt = require("bcryptjs")

const {getToken} = require('../../config/passport')
const { getDataModel } = require('../../../config/config');
const User = require('../../models/User');
require(`../../utils/studio/${getDataModel()}/functions`);


const {
  getProductionRoot,
  getProductionPort
} = require("../../../config/config");
const { retainRequiredFields, filterDataUser, callPreprocessGet } = require("../../utils/database")
const {
  ROLES,
  RES_TO_COME
} = require(`../../../utils/${getDataModel()}/consts`);
const {
  HTTP_CODES,
  NotFoundError,
  ForbiddenError
} = require("../../utils/errors");
const { getModels } = require("../../utils/database");
const { ACTIONS } = require("../../utils/studio/actions");
const { buildQuery, addComputedFields } = require("../../utils/database");

const router = express.Router();

const PRODUCTION_ROOT = getProductionRoot();
const PRODUCTION_PORT = getProductionPort();


const login = (email, password) => {
  console.log(`Login with ${email} and ${password}`);
  return User.findOne({ email }).then(user => {
    if (!user) {
      console.error(`No user with email ${email}`)
      throw new NotFoundError(`Invalid email or password`);
    }
    console.log(`Comparing ${password} and ${user.password}`);
    return bcrypt.compare(password, user.password).then(matched => {
      // TODO : to test
      matched = true;
      console.log(`Matched:${matched}`);
      if (!matched) {
        throw new NotFoundError(`Invalid email or password`);
      }
      return user;
    });
  });
};

router.get("/models", (req, res) => {
  const allModels = getModels();
  return res.json(allModels);
});

router.get("/roles", (req, res) => {
  console.log();
  return res.json(ROLES);
});

router.post("/file", (req, res) => {
  const { projectName, filePath, contents } = req.body;
  if (!(projectName && filePath && contents)) {
    return res.status(HTTP_CODES.BAD_REQUEST).json();
  }
  const destpath = path.join(PRODUCTION_ROOT, projectName, "src", filePath);
  console.log(`Copying in ${destpath}`);
  return fs
    .writeFile(destpath, contents)
    .then(() => {
      return res.json();
    })
    .catch(err => {
      return res.status(HTTP_CODES.SYSTEM_ERROR).json(err);
    });
});

router.post("/install", (req, res) => {
  const { projectName } = req.body;
  if (!projectName) {
    return res.status(HTTP_CODES.BAD_REQUEST).json();
  }

  const destpath = path.join(PRODUCTION_ROOT, projectName);
  const result = child_process.execSync(
    "yarn install",
    {
      cwd: destpath
    },
    (error, stdout, stderr) => {
      console.log(`Error:${error}`);
      console.log(`Stdout:${stdout}`);
      console.log(`stderr:${stderr}`);
      if (error) {
        return res.status(HTTP_CODES.SYSTEM_ERROR).json(error);
      }
      return res.json();
    }
  );
  console.log(`Install result:${result}`);
  return res.json(result);
});

router.post("/build", (req, res) => {
  const { projectName } = req.body;
  if (!projectName) {
    return res.status(HTTP_CODES.BAD_REQUEST).json();
  }

  const destpath = path.join(PRODUCTION_ROOT, projectName);
  const result = child_process.execSync(
    "yarn build",
    {
      cwd: destpath
    },
    (error, stdout, stderr) => {
      console.log(`Error:${error}`);
      console.log(`Stdout:${stdout}`);
      console.log(`stderr:${stderr}`);
      if (error) {
        return res.status(HTTP_CODES.SYSTEM_ERROR).json(error);
      }
      return res.json();
    }
  );
  console.log(`Build result:${result}`);
  return res.json(result);
});

router.post("/start", (req, res) => {
  const { projectName } = req.body;
  if (!projectName) {
    return res.status(HTTP_CODES.BAD_REQUEST).json();
  }

  const destpath = path.join(PRODUCTION_ROOT, projectName);
  const result = child_process.exec(
    `serve -p ${PRODUCTION_PORT} build/`,
    {
      cwd: destpath
    },
    (error, stdout, stderr) => {
      console.log(`Error:${error}`);
      console.log(`Stdout:${stdout}`);
      console.log(`stderr:${stderr}`);
    }
  );
  console.log(`Start result:${result}`);
  return res.json(result);
});

router.post("/action", passport.authenticate("cookie", { session: false }), (req, res) => {
    const action = req.body.action;
    const actionFn = ACTIONS[action];
    if (!actionFn) {
      console.error(`Unkown action:${action}`);
      return res.status(404).json(`Unkown action:${action}`);
    }

    return actionFn(req.body, req.user, req.get("Referrer"))
      .then(result => {
        return res.json(result);
      })
      .catch(err => {
        console.error(err);
        return res
          .status(err.status || HTTP_CODES.SYSTEM_ERROR)
          .json(err.message || err);
      });
  }
);

router.post("/login", (req, res) => {
  console.log(`Trying to log`);
  const { email, password } = req.body;
 
  return Promise.resolve(login(email, password))
    .then(user => {
      Promise.resolve(getToken(user))
        .then(token => {
          res.header('Access-Control-Allow-Credentials', true)
          res.header('Access-Control-Allow-Origin', req.headers.origin)
          res.header('access-control-expose-headers', '*')
          const cookieParams = {
            httpOnly: true,
            secure: true,
          }
          res.cookie('token', token, cookieParams)
          res.send(token)
        })
        .catch(err => console.log(err))
    })
    .catch(err => {
      console.log(err)
      return res.status(err.status || HTTP_CODES.SYSTEM_ERROR).json(err.message || err)
    })
});

// router.post('/scormupdate', passport.authenticate('cookie', {session: false}), (req, res) => {
router.post("/scormupdate", (req, res) => {
  const value = req.body;
  const idRessource = req?.body?.cmi?.entry;
  const user = req.user;

  // console.log(value, idRessource, user)
  console.log(value);

  // const updateScorm = UserSessionData.findOneAndUpdate({
  //   user: user._id,
  // }, {
  //   user: user._id,
  // }, {
  //   upsert: true,
  //   new: true,
  // })
  //   .then(data => {
  //     const scormProgress = data?.modules_progress?.find(a => a.resource._id.toString() == idRessource.toString())
  //     if (scormProgress) {
  //       scormProgress.module_progress = value
  //     }
  //     else {
  //       data.modules_progress.push({
  //         resource: parent,
  //         module_progress: value,
  //       })
  //     }
  //     return data.save()
  //   })
  //   .catch(e => console.error(e))

  // return res.json(updateScorm)
  return res.json({});
});

router.get("/current-user", passport.authenticate("cookie", { session: false }), (req, res) => {
    return res.json(req.user);
  }
);

router.post("/:model", passport.authenticate("cookie", { session: false }), (req, res) => {
  const model = req.params.model;
  const context= req.query.context
  const params=model=='order' && context ? {booking: context}:{}
  return mongoose.connection.models[model]
    .create(params)
    .then(data => {
      return res.json(data);
    })
    .catch(err => {
      return res.status(500).json(err);
    });
});

router.get("/:model/:id?", passport.authenticate("cookie", { session: false }), (req, res) => {
    const model = req.params.model;
    let fields = req.query.fields?.split(",") || [];
    const id = req.params.id;
    const params = req.get("Referrer")
      ? { ...url.parse(req.get("Referrer"), true).query }
      : {};
    const user = req.user;

    console.log(`GET ${model}/${id} ${fields}`);

    callPreprocessGet({model, fields, id, user: req.user})
      .then(({model, fields, id, data}) => {
        if (data) {
          return res.json(data)
        }
        else return  buildQuery(model, id, fields)
          .lean({ virtuals: true })
          .then(data => {
            // Force duplicate children
            data = JSON.parse(JSON.stringify(data));
            // Remove extra virtuals
            data = retainRequiredFields({ data, fields });
            if (id && data.length == 0) { throw new NotFoundError(`Can't find ${model}:${id}`) }
            return Promise.all(data.map(d => addComputedFields(user, params, d, model)))
          })
          .then(data => {
            return id ? Promise.resolve(data) : filterDataUser({ model, data, user: req.user })
          })
          .then(data => {
            if (["theme", "resource"].includes(model) && !id) {
              data = data.filter(t => t.name);
            }
            if (id && model == "resource" && data[0]?.status == RES_TO_COME) {
              throw new ForbiddenError(`Ressource non encore disponible`);
            }
            console.log(`GET ${model}/${id} ${fields}: data sent`);
            return res.json(data);
          })
          .catch(err => {
            console.error(err);
            return res.status(err.status || 500).json(err.message || err);
        })
      })
  }
);

module.exports = router;
