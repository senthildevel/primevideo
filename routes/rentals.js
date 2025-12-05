const { Rental, validate } = require('../models/rental');
const { Movie } = require('../models/movie');
const { Customer } = require('../models/customer');
const mongoose = require('mongoose');

const express = require('express');
const router = express.Router();


router.get('/', async (req, res) => {
  const rentals = await Rental.find().sort('-dateOut');
  res.send(rentals);
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send('Invalid customer.');

  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(400).send('Invalid movie.');

  if (movie.numberInStock === 0) return res.status(400).send('Movie not in stock.');

  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    let rental = new Rental({
      customer: {
        _id: customer._id,
        name: customer.name,
        phone: customer.phone
      },
      movie: {
        _id: movie._id,
        title: movie.title,
        dailyRentalRate: movie.dailyRentalRate
      }
    });


    // Transaction 1
    rental = await rental.save({ session });

    // decrement - faileed
    // movie.numberInStock--;
    // movie.save({ session });

    /* Movie.updateOne({ _id: movie._id }, {
     $inc: { numberInStock: -1 }
   }, { session })
   */

    await Movie.updateOne(
      { _id: '1234' },
      { $inc: { numberInStock: -1 } },
      { session }
    );


    await session.commitTransaction();
    session.endSession();

    res.send(rental);

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    // write into a log 

    res.status(500).send("Transaction failed " + err.message)

  }


});

router.get('/:id', async (req, res) => {
  const rental = await Rental.findById(req.params.id);

  if (!rental) return res.status(404).send('The rental with the given ID was not found.');

  res.send(rental);
});

module.exports = router;

/* 
Transaction 

John send 100 rs to james 100 

 JOhn ac - 100 minus 
  server down, this.name.w issue 
 James ac 100 + 



 Transaction : 
   Group of operation executes in a single atomic unit 

   either executes 10 operation

   atomicity - collection 

 */