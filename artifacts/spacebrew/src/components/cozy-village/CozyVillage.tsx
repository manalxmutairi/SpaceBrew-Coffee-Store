import beansOpen from './assets/beans-open.webp';
import beansMacro from './assets/beans-macro.webp';
import beansSunlight from './assets/beans-sunlight.webp';
import beansScoop from './assets/beans-scoop.webp';
import mugPhoto from './assets/mug-photo.webp';
import travelPhoto from './assets/travel-photo.webp';
import grinderPhoto from './assets/grinder-photo.webp';
import pourOverPhoto from './assets/pour-over-photo.webp';
import { useState } from 'react';
import { ArrowDown, ArrowRight, Bean, Heart, Leaf, Menu, Moon, ShoppingBag, Sparkles, X } from 'lucide-react';

type Product = {
  id: string; name: string; origin: string; description: string; price: number;
  image: string; imageAlt: string; category: 'coffee' | 'gear';
};
const coffeePhotos = [
  { image: beansOpen, imageAlt: 'Glossy roasted coffee beans spilling from an open burlap sack' },
  { image: beansMacro, imageAlt: 'A real close-up photograph of richly roasted Arabica coffee beans' },
  { image: beansSunlight, imageAlt: 'Roasted coffee beans photographed in warm natural sunlight' },
  { image: beansScoop, imageAlt: 'A scoop of whole coffee beans beside a rustic coffee sack' },
];
const products: Product[] = [
  { id: 'moonbeam', name: 'Moonbeam Blend', origin: 'THE NIGHT OWL', description: 'Dark chocolate, toasted hazelnut, a little midnight magic.', price: 5.500, ...coffeePhotos[0], category: 'coffee' },
  { id: 'sunspell', name: 'Sunspell Roast', origin: 'THE BRIGHT SIDE', description: 'Apricot jam and honey for first-light kind of mornings.', price: 5.750, ...coffeePhotos[1], category: 'coffee' },
  { id: 'stardust', name: 'Stardust Decaf', origin: 'THE SLOW SPELL', description: 'Soft cocoa and sweet orange. All the ritual, no rush.', price: 5.250, ...coffeePhotos[2], category: 'coffee' },
  { id: 'comet', name: 'Comet Chaser', origin: 'THE WANDERER', description: 'Juicy berries and caramel with a bright little kick.', price: 6.000, ...coffeePhotos[3], category: 'coffee' },
  { id: 'cloudberry', name: 'Cloudberry Daybreak', origin: 'THE EARLY RISER', description: 'Sweet citrus, almond, and a soft golden finish.', price: 5.750, ...coffeePhotos[1], category: 'coffee' },
  { id: 'cinder', name: 'Cinder & Cinnamon', origin: 'THE FIRESIDE', description: 'Brown sugar, warm spice, and a crackling cocoa note.', price: 5.500, ...coffeePhotos[0], category: 'coffee' },
  { id: 'blue-hour', name: 'Blue Hour Espresso', origin: 'THE NIGHT FLIGHT', description: 'A syrupy double-shot blend with plum and dark caramel.', price: 6.500, ...coffeePhotos[2], category: 'coffee' },
  { id: 'honey-orbit', name: 'Honey Orbit', origin: 'THE DAYDREAMER', description: 'Floral honey, ripe pear, and a mellow tea-like finish.', price: 6.000, ...coffeePhotos[3], category: 'coffee' },
  { id: 'moon-phase-mug', name: 'Moon Phase Mug', origin: 'CERAMIC COFFEE CUP', description: 'A simple white ceramic cup, ready for your slow morning pour.', price: 5.500, image: mugPhoto, imageAlt: 'A plain white ceramic coffee cup on a warm wooden table', category: 'gear' },
  { id: 'orbit-travel-cup', name: 'Orbit Travel Cup', origin: 'LIDDED COFFEE CUP', description: 'A simple lidded cup for taking your favorite roast on the move.', price: 8.000, image: travelPhoto, imageAlt: 'A blank white takeaway coffee cup with a black lid', category: 'gear' },
  { id: 'comet-hand-grinder', name: 'Comet Hand Grinder', origin: 'MANUAL COFFEE GRINDER', description: 'A classic hand-crank grinder with a wooden catch drawer.', price: 13.500, image: grinderPhoto, imageAlt: 'A vintage-style wooden hand coffee grinder with crank', category: 'gear' },
  { id: 'stardust-pour-over', name: 'Stardust Pour-Over Set', origin: 'GLASS COFFEE BREWER', description: 'A glass pour-over brewer photographed mid-brew, steam and all.', price: 10.000, image: pourOverPhoto, imageAlt: 'A glass pour-over coffee brewer releasing steam', category: 'gear' },
];
const formatKwd = (amount: number) => `KWD ${amount.toFixed(3)}`;

function Brand() {
  return <a href="#home" className="village-brand" aria-label="Cosmic Beans home"><span className="brand-seal"><Bean size={19} /></span><span>COSMIC <i>BEANS</i></span></a>;
}
function ProductCard({ product, favorite, quantity, onFavorite, onAdd }: {
  product: Product; favorite: boolean; quantity: number; onFavorite: () => void; onAdd: () => void;
}) {
  const [added, setAdded] = useState(false);
  const add = () => { onAdd(); setAdded(true); window.setTimeout(() => setAdded(false), 1100); };
  return (
    <article className={`v-product ${product.category === 'gear' ? 'v-gear' : ''}`} data-testid={`card-product-${product.id}`}>
      <div className="v-product-image">
        <img src={product.image} alt={product.imageAlt} />
        <span className="photo-index">{product.category === 'coffee' ? 'ROASTED WITH CARE' : 'COUNTER COMPANION'}</span>
        <button type="button" className={`v-favorite ${favorite ? 'selected' : ''}`} onClick={onFavorite} aria-label={favorite ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`} aria-pressed={favorite}><Heart size={17} fill={favorite ? 'currentColor' : 'none'} /></button>
        {quantity > 0 && <span className="v-qty">In your bag · {quantity}</span>}
      </div>
      <div className="v-product-copy"><span className="v-product-origin">{product.origin}</span><h3>{product.name}</h3><p>{product.description}</p>
        <div className="v-product-footer"><strong>{formatKwd(product.price)}</strong><button type="button" className={`v-add ${added ? 'added' : ''}`} onClick={add} aria-label={`Add ${product.name} to cart`}>{added ? 'Added to bag' : 'Add to bag'} <ArrowRight size={14} /></button></div>
      </div>
    </article>
  );
}

function CozyVillage() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const count = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const cartProducts = products.filter((item) => cart[item.id]);
  const subtotal = cartProducts.reduce((sum, item) => sum + item.price * cart[item.id], 0);
  const toggleFavorite = (id: string) => setFavorites((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const addToCart = (id: string) => setCart((items) => ({ ...items, [id]: (items[id] ?? 0) + 1 }));
  return (
    <div className="cozy-village" id="home">
      <div className="v-offer"><span>FIRST VISIT?</span><b>Take 10% off your first order</b><a href="#beans">Find your roast <ArrowRight size={13} /></a></div>
      <header className="v-header">
        <nav className="v-nav" aria-label="Main navigation">
          <button className="v-menu-toggle" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><Menu size={20} /></button>
          <Brand />
          <div className={`v-links ${menuOpen ? 'open' : ''}`}><a href="#beans" onClick={() => setMenuOpen(false)}>Coffee</a><a href="#merchandise" onClick={() => setMenuOpen(false)}>Brew things</a><a href="#brew-guide" onClick={() => setMenuOpen(false)}>Brew guide</a><a href="#about" onClick={() => setMenuOpen(false)}>Our little story</a></div>
          <button className="v-bag" onClick={() => setCartOpen(!cartOpen)} aria-expanded={cartOpen} aria-controls="v-cart"><ShoppingBag size={17} /><span>Bag</span><b>{count}</b></button>
        </nav>
        {cartOpen && <aside className="v-cart" id="v-cart" aria-label="Your shopping bag">
          <div className="v-cart-head"><div><small>YOUR LITTLE STASH</small><h2>Your bag</h2></div><button onClick={() => setCartOpen(false)} aria-label="Close bag"><X size={18} /></button></div>
          {cartProducts.length ? <><div className="v-cart-lines">{cartProducts.map((item) => <div className="v-cart-line" key={item.id}><img src={item.image} alt="" /><span>{item.name}<small>Qty {cart[item.id]}</small></span><b>{formatKwd(item.price * cart[item.id])}</b></div>)}</div><div className="v-subtotal"><span>Subtotal</span><b>{formatKwd(subtotal)}</b></div><p className="v-cart-note">Preview only — checkout is not available yet.</p></> :
            <div className="v-cart-empty"><span className="empty-cup"><Moon size={23} /></span><b>Your bag is taking a nap.</b><span>Let’s find it something lovely.</span><a href="#shop" onClick={() => setCartOpen(false)}>Explore the shop <ArrowRight size={14} /></a></div>}
        </aside>}
      </header>
      <main>
        <section className="v-hero">
          <div className="v-wallpaper" aria-hidden="true" /><div className="v-cloud cloud-a" aria-hidden="true" /><div className="v-cloud cloud-b" aria-hidden="true" />
          <div className="v-hero-content"><div className="v-kicker"><span /> A LITTLE ROASTERY AT THE END OF THE LANE</div><h1>Take the<br />long way <em>home.</em></h1><p>Small-batch coffee for slow mornings, open windows, and the lovely little rituals that make a day yours.</p><a className="v-hero-button" href="#beans">Wander to the coffee <ArrowDown size={16} /></a><div className="v-hero-foot"><span>ROASTED IN SMALL BATCHES</span><span className="foot-star">✳</span><span>SENT FROM OUR LITTLE ROASTERY</span></div></div>
          <div className="v-house-note"><Sparkles size={16} /><span>THE VILLAGE<br />IS A LITTLE SLOWER HERE</span></div><div className="v-hero-caption"><span>01 / THE ROAD HOME</span><span>EVENING LIGHT · EST. EVERY MORNING</span></div>
        </section>
        <div className="v-ribbon" aria-label="Cosmic Beans"><span>GOOD COFFEE FOR A SMALLER, SOFTER WORLD</span><i>✳</i><span>TAKE THE SCENIC ROUTE</span><i>✳</i><span>GOOD COFFEE FOR A SMALLER, SOFTER WORLD</span></div>
        <section className="v-shop" id="shop">
          <div className="v-section-intro" id="beans"><div><span className="v-overline">FROM THE ROASTING SHED</span><h2>Beans for your<br /><em>own little ritual.</em></h2></div><p>Eight small-batch roasts, each with its own sort of weather. Follow the notes that sound like your kind of morning.</p><div className="v-count-stamp"><span>08</span><small>ROASTS<br />TO WANDER</small></div></div>
          <div className="v-products">{products.filter((p) => p.category === 'coffee').map((product, index) => <div className={`v-product-wrap coffee-card card-${index + 1}`} key={product.id}><ProductCard product={product} favorite={favorites.includes(product.id)} quantity={cart[product.id] ?? 0} onFavorite={() => toggleFavorite(product.id)} onAdd={() => addToCart(product.id)} /></div>)}</div>
          <section className="v-merch-section" id="merchandise"><div className="v-merch-head"><div><span className="v-overline">USEFUL LITTLE THINGS</span><h2>Keep the ritual<br /><em>close at hand.</em></h2></div><p>Real tools for the warm part of your day. Nothing fancy, just things worth reaching for.</p></div>
            <div className="v-products v-merch-products">{products.filter((p) => p.category === 'gear').map((product) => <ProductCard key={product.id} product={product} favorite={favorites.includes(product.id)} quantity={cart[product.id] ?? 0} onFavorite={() => toggleFavorite(product.id)} onAdd={() => addToCart(product.id)} />)}</div>
          </section>
        </section>
        <section className="v-brew" id="brew-guide"><div className="v-brew-scribble" aria-hidden="true">slow<br />down</div><div className="v-brew-inner">
          <div className="v-brew-intro"><span className="v-overline">A NOTE FROM THE KETTLE</span><h2>A better cup,<br /><em>one pour at a time.</em></h2><p>A simple pour-over recipe for any Cosmic Beans roast. Adjust the grind finer for more body, coarser for a lighter cup.</p><div className="v-recipe-tag"><Bean size={15} /> OUR EVERYDAY POUR</div></div>
          <div className="v-recipe"><div className="v-ratio"><span>ONE COMFORTING CUP</span><b>15g coffee <i>·</i> 250g water</b><small>Medium grind · 93°C · about 3 minutes</small></div><ol><li><b>Rinse</b><span>Warm your dripper and filter, then discard the rinse water.</span></li><li><b>Bloom</b><span>Add grounds and pour 40g water. Wait 30 seconds.</span></li><li><b>Pour</b><span>Slowly pour in circles to 250g total, keeping the bed level.</span></li><li><b>Enjoy</b><span>Let it finish dripping, swirl, and serve while warm.</span></li></ol></div>
        </div></section>
        <section className="v-story" id="about"><div className="v-story-image"><div className="v-story-label">A POSTCARD<br />FROM OUR LANE</div><div className="v-story-bottom"><span>COME IN, THE KETTLE’S ON</span><span>45° 31' N · SOMEWHERE QUIET</span></div></div>
          <div className="v-story-copy"><span className="v-overline">A NOTE FROM OUR TINY ROASTERY</span><h2>Every great story<br />starts with a <em>good cup.</em></h2><p>Cosmic Beans began with a well-loved kettle, a sky full of stars, and the belief that the everyday deserves a little wonder. We roast in small batches, source with care, and save you the first sip.</p><a href="#shop">Find your first favorite <ArrowRight size={15} /></a><div className="v-signoff"><span className="signoff-line" /> From our village to your table</div></div>
        </section>
        <section className="v-promises" aria-label="Our promises"><div className="promise-title"><span className="v-overline">THE WAY WE DO THINGS</span><h2>Small things, <em>done well.</em></h2></div>
          <div className="v-promise"><span className="promise-icon"><Sparkles size={19} /></span><div><h3>Fresh from the roaster</h3><p>Fresh little lots, never forgotten at the back of a warehouse.</p></div></div>
          <div className="v-promise"><span className="promise-icon"><Leaf size={19} /></span><div><h3>Thoughtful from the start</h3><p>Good relationships with the people and places behind every bean.</p></div></div>
          <div className="v-promise"><span className="promise-icon"><Moon size={19} /></span><div><h3>Made for your ritual</h3><p>For sunrise plans, rainy pages, and one more chapter nights.</p></div></div>
        </section>
      </main>
      <footer className="v-footer"><div className="v-footer-top"><Brand /><p>Magical beans for your<br />daily adventure.</p><a href="#home">Back up the lane <ArrowRight size={14} /></a></div><div className="v-footer-base"><span>© COSMIC BEANS · ROASTED WITH CARE</span><span>TAKE THE LONG WAY HOME</span></div></footer>
    </div>
  );
}
export default CozyVillage;
