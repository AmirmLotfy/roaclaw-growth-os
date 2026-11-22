'use client';

import { useState } from 'react';

export function DemoCheckout() {
  const [quantity, setQuantity] = useState(0);
  return <>
    <button className="button primary" onClick={() => setQuantity(quantity + 1)}>Add to cart</button>
    <p className="muted" aria-live="polite">
      {quantity === 0 ? 'Demo storefront. Checkout is disabled.' : quantity + ' demo item' + (quantity === 1 ? '' : 's') + ' in cart.'}
    </p>
  </>;
}
