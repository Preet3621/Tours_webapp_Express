/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe('pk_test_51ORuelSE0CCo9HlaDF4cLkpiEkTJhp6XxkvMVXHRB3JFdmEs7zgHB744I3Zt3sRZpFdxezeWa7xEDE6LXfsLeO4R00oL4K7fak');

export const bookTour = async tourId => {
  try {
    console.log('comes into book tour..')
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);

    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};