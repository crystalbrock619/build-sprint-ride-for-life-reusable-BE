const express = require('express');
const bcrypt = require('bcryptjs');

const Drivers = require('./drivers-model');
const checkPassword = require('./driverpw-middleware');

const router = express();

// GET /api/drivers endpoint - Functional!
router.get('/', (req, res) => {
  Drivers.find()
    .then(drivers => {
      const updatedDrivers = drivers.map(driver => {
        return {
          ...driver,
          available:
            driver.available === 1 || driver.available === true ? true : false,
        };
      });
      res.status(200).json(updatedDrivers);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: 'Failed to get drivers' });
    });
});

// GET /api/drivers/:id endpoint - Functional!
router.get('/:id', (req, res) => {
  Drivers.findById(req.params.id)
    .then(driver => {
      if (driver) {
        driver.available =
          driver.available === 1 || driver.available === true ? true : false;
        res.status(200).json(driver);
      } else {
        res
          .status(404)
          .json({ message: 'Could not find driver with provided ID' });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: 'Failed to get driver' });
    });
});

// GET /api/drivers/:id/reviews endpoint - Functional!
router.get('/:id/reviews', (req, res) => {
  Drivers.findReviewsById(req.params.id)
    .then(reviews => {
      if (reviews.length) {
        const updatedReviews = reviews.map(review => {
          if (review.anonymous === 1 || review.anonymous === true) {
            delete review.reviewer;
          }
          return {
            ...review,
            anonymous:
              review.anonymous === 1 || review.anonymous === true
                ? true
                : false,
          };
        });
        res.status(200).json(updatedReviews);
      } else {
        res
          .status(404)
          .json({ message: 'Could not find reviews for that driver' });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: 'Failed to get reviews' });
    });
});

// PUT /api/drivers/:id endpoint -
router.put('/:id', checkPassword, (req, res) => {
  const { id } = req.params;
  const changes = req.body;

  if (
    changes.hasOwnProperty('name') ||
    changes.hasOwnProperty('newPassword') ||
    changes.hasOwnProperty('location') ||
    changes.hasOwnProperty('price') ||
    changes.hasOwnProperty('bio') ||
    changes.hasOwnProperty('available')
  ) {
    if (changes.hasOwnProperty('newPassword')) {
      const hash = bcrypt.hashSync(changes.newPassword, 8);
      changes.password = hash;
      delete changes.newPassword;
    } else {
      delete changes.password;
    }

    Drivers.findById(id)
      .then(driver => {
        if (driver) {
          Drivers.update(changes, id).then(updated => {
            updated.available =
              updated.available === 1 || updated.available === true
                ? true
                : false;
            res.status(200).json(updated);
          });
        } else {
          res
            .status(404)
            .json({ message: 'Could not find driver with provided ID' });
        }
      })
      .catch(err => {
        console.log(err);
        res
          .status(500)
          .json({ message: 'Failed to update driver information' });
      });
  } else {
    res
      .status(400)
      .json({ message: 'Please provide driver information to update' });
  }
});

// DEL /api/drivers/:id endpoint - Functional!
router.delete('/:id', (req, res) => {
  Drivers.remove(req.params.id)
    .then(count => {
      if (count) {
        res.status(200).json({ message: 'The driver has been deleted' });
      } else {
        res.status(404).json({ message: 'Invalid driver ID' });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: 'Error deleting the driver' });
    });
});

module.exports = router;
