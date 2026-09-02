const { PythonShell } = require('python-shell');
const path = require('path');

// Path to the model file relative to this module
const modelPath = path.join(__dirname, '../../ml-service/models/baseline.pkl');

function predict(requestObj) {
  return new Promise((resolve, reject) => {
    const options = {
      mode: 'json',
      pythonOptions: ['-u'],
      scriptPath: path.join(__dirname, '../../ml-service'),
      args: [modelPath]
    };
    PythonShell.run('predict_helper.py', options, (err, results) => {
      if (err) return reject(err);
      resolve(results && results[0] ? results[0].prediction : null);
    }).send(JSON.stringify(requestObj));
  });
}

module.exports = { predict };
