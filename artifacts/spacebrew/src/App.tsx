import { useState } from 'react';
import { ArrowDownRight, ArrowRight, Bean, Coffee, CupSoda, Filter, Heart, Leaf, Moon, Settings2, ShoppingBag, Sparkles, X } from 'lucide-react';

type Product = {
  id: string;
  name: string;
  origin: string;
  description: string;
  price: number;
  tone: string;
  category: 'coffee' | 'gear';
  visual?: 'mug' | 'tumbler' | 'grinder' | 'dripper';
};

const products: Product[] = [
  {
    id: 'moonbeam',
    name: 'Moonbeam Blend',
    origin: 'THE NIGHT OWL',
    description: 'Dark chocolate, toasted hazelnut, a little midnight magic.',
    price: 18,
    tone: 'peach',
    category: 'coffee',
  },
  {
    id: 'sunspell',
    name: 'Sunspell Roast',
    origin: 'THE BRIGHT SIDE',
    description: 'Apricot jam and honey for first-light kind of mornings.',
    price: 19,
    tone: 'blue',
    category: 'coffee',
  },
  {
    id: 'stardust',
    name: 'Stardust Decaf',
    origin: 'THE SLOW SPELL',
    description: 'Soft cocoa and sweet orange. All the ritual, no rush.',
    price: 17,
    tone: 'yellow',
    category: 'coffee',
  },
  {
    id: 'comet',
    name: 'Comet Chaser',
    origin: 'THE WANDERER',
    description: 'Juicy berries and caramel with a bright little kick.',
    price: 20,
    tone: 'rose',
    category: 'coffee',
  },
  {
    id: 'cloudberry',
    name: 'Cloudberry Daybreak',
    origin: 'THE EARLY RISER',
    description: 'Sweet citrus, almond, and a soft golden finish.',
    price: 19,
    tone: 'yellow',
    category: 'coffee',
  },
  {
    id: 'cinder',
    name: 'Cinder & Cinnamon',
    origin: 'THE FIRESIDE',
    description: 'Brown sugar, warm spice, and a crackling cocoa note.',
    price: 18,
    tone: 'peach',
    category: 'coffee',
  },
  {
    id: 'blue-hour',
    name: 'Blue Hour Espresso',
    origin: 'THE NIGHT FLIGHT',
    description: 'A syrupy double-shot blend with plum and dark caramel.',
    price: 21,
    tone: 'blue',
    category: 'coffee',
  },
  {
    id: 'honey-orbit',
    name: 'Honey Orbit',
    origin: 'THE DAYDREAMER',
    description: 'Floral honey, ripe pear, and a mellow tea-like finish.',
    price: 20,
    tone: 'rose',
    category: 'coffee',
  },
  {
    id: 'moon-phase-mug',
    name: 'Moon Phase Mug',
    origin: 'HAND-THROWN CERAMIC',
    description: 'A midnight-blue mug with a little gold moon inside.',
    price: 18,
    tone: 'blue',
    category: 'gear',
    visual: 'mug',
  },
  {
    id: 'orbit-travel-cup',
    name: 'Orbit Travel Cup',
    origin: 'REUSABLE · DOUBLE-WALL',
    description: 'A cozy, spill-resistant cup for coffee on the move.',
    price: 26,
    tone: 'rose',
    category: 'gear',
    visual: 'tumbler',
  },
  {
    id: 'comet-hand-grinder',
    name: 'Comet Hand Grinder',
    origin: 'BURR GRINDER',
    description: 'A compact hand grinder for fresh grounds anywhere.',
    price: 44,
    tone: 'peach',
    category: 'gear',
    visual: 'grinder',
  },
  {
    id: 'stardust-pour-over',
    name: 'Stardust Pour-Over Set',
    origin: 'CERAMIC DRIPPER',
    description: 'A slow-brew dripper and reusable filter for easy mornings.',
    price: 32,
    tone: 'yellow',
    category: 'gear',
    visual: 'dripper',
  },
];

function Brand() {
  return (
    <a className="brand" href="#home" aria-label="Cosmic Beans home" data-testid="link-brand-home">
      <span className="brand-mark"><Bean size={22} strokeWidth={1.8} /></span>
      <span className="brand-name">Cosmic<span> Beans</span></span>
    </a>
  );
}

function ProductCard({
  product,
  favorite,
  quantity,
  onFavorite,
  onAdd,
}: {
  product: Product;
  favorite: boolean;
  quantity: number;
  onFavorite: () => void;
  onAdd: () => void;
}) {
  const [justAdded, setJustAdded] = useState(false);

  const addItem = () => {
    onAdd();
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <article className="product-card" data-testid={`card-product-${product.id}`}>
      <div className="product-visual" data-tone={product.tone} data-category={product.category} data-testid={`visual-product-${product.id}`}>
        <button
          type="button"
          className={`favorite${favorite ? ' is-favorite' : ''}`}
          onClick={onFavorite}
          aria-label={favorite ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}
          aria-pressed={favorite}
          data-testid={`button-favorite-${product.id}`}
        >
          <Heart size={17} fill={favorite ? 'currentColor' : 'none'} strokeWidth={1.8} />
        </button>
        {product.category === 'coffee' ? (
          <div className="coffee-package" aria-hidden="true">
            <img src="/cosmic-beans-pouch.png" alt="" className="coffee-package-image" />
            <span className="coffee-package-brand">COSMIC<br />BEANS</span>
          </div>
        ) : (
          <div className={`gear-art gear-${product.visual}`} aria-hidden="true">
            {product.visual === 'mug' && <Coffee size={76} strokeWidth={1.35} />}
            {product.visual === 'tumbler' && <CupSoda size={76} strokeWidth={1.35} />}
            {product.visual === 'grinder' && <Settings2 size={76} strokeWidth={1.35} />}
            {product.visual === 'dripper' && <Filter size={76} strokeWidth={1.35} />}
          </div>
        )}
        {quantity > 0 && <span className="cart-live" data-testid={`status-quantity-${product.id}`}>In your bag: {quantity}</span>}
      </div>
      <div className="product-info">
        <div className="product-tag">{product.origin}</div>
        <h3 className="product-name" data-testid={`text-product-name-${product.id}`}>{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-bottom">
          <span className="price" data-testid={`text-product-price-${product.id}`}>${product.price}.00</span>
          <button
            type="button"
            onClick={addItem}
            className={`add-button${justAdded ? ' added' : ''}`}
            data-testid={`button-add-${product.id}`}
            aria-label={`Add ${product.name} to cart`}
          >
            {justAdded ? <>Added! <span aria-hidden="true">✓</span></> : <>Add to Cart <ArrowRight size={14} /></>}
          </button>
        </div>
      </div>
    </article>
  );
}

function Home() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const cartProducts = products.filter((product) => cart[product.id]);
  const subtotal = cartProducts.reduce((sum, product) => sum + product.price * cart[product.id], 0);

  const toggleFavorite = (id: string) => {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };
  const addToCart = (id: string) => {
    setCart((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 }));
  };

  return (
    <div className="site-shell" id="home">
      <div className="offer-banner" role="note" data-testid="banner-new-customer-offer">
        <span className="offer-label">NEW CUSTOMER PERK</span>
        <strong>Take 10% off your first order</strong>
        <a href="#shop" data-testid="link-offer-shop">Explore the shop <ArrowRight size={13} /></a>
      </div>
      <div className="topline">Freshly roasted for wherever you’re headed next</div>
      <header className="nav-wrap">
        <nav className="nav" aria-label="Main navigation">
          <Brand />
          <div className="nav-links">
            <a href="#home" data-testid="link-home">Home</a>
            <a href="#shop" data-testid="link-shop">Shop</a>
            <a href="#about" data-testid="link-about">Our story</a>
          </div>
          <button
            type="button"
            className="cart-button"
            onClick={() => setCartOpen((open) => !open)}
            aria-expanded={cartOpen}
            aria-controls="cart-panel"
            data-testid="button-cart"
          >
            <ShoppingBag size={17} />
            <span>Bag</span>
            <span className="cart-count" data-testid="text-cart-count" aria-live="polite">{cartCount}</span>
          </button>
          <span className="cart-live" aria-live="polite" data-testid="status-cart-live">
            {cartCount === 1 ? '1 item in your bag' : `${cartCount} items in your bag`}
          </span>
        </nav>
        {cartOpen && (
          <aside className="cart-panel" id="cart-panel" aria-label="Your shopping bag" data-testid="panel-cart">
            <div className="cart-panel-head">
              <div><span className="product-tag">YOUR LITTLE STASH</span><h2>Your bag</h2></div>
              <button type="button" className="cart-close" onClick={() => setCartOpen(false)} aria-label="Close bag" data-testid="button-close-cart"><X size={18} /></button>
            </div>
            {cartProducts.length ? (
              <>
                <div className="cart-lines">
                  {cartProducts.map((product) => (
                    <div className="cart-line" key={product.id} data-testid={`row-cart-${product.id}`}>
                      <span className={`cart-swatch ${product.tone}`} aria-hidden="true" />
                      <span className="cart-line-name">{product.name}<small>Qty {cart[product.id]}</small></span>
                      <span className="cart-line-price">${(product.price * cart[product.id]).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="cart-subtotal"><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div>
                <p className="cart-note">Just a little preview — checkout isn’t part of this adventure.</p>
              </>
            ) : (
              <div className="cart-empty">
                <span className="empty-moon"><Moon size={24} /></span>
                <strong>Your bag is taking a nap.</strong>
                <span>Let’s find it something lovely.</span>
                <a href="#shop" onClick={() => setCartOpen(false)} data-testid="link-cart-shop">Explore the shop <ArrowRight size={14} /></a>
              </div>
            )}
          </aside>
        )}
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="eyebrow">A little magic in every morning</div>
            <h1 id="hero-title">Magical beans for your <em>daily adventure!</em></h1>
            <p className="hero-lead">Small-batch coffee for big-hearted dreamers, late-night readers, and anyone with somewhere wonderful to be.</p>
            <a className="hero-cta" href="#shop" data-testid="button-shop-now">Shop the beans <ArrowDownRight size={17} /></a>
            <div className="hero-note">ROASTED WITH CARE · SENT WITH A LITTLE STARDUST</div>
          </div>
          <div className="hero-art" aria-label="A cozy little coffee shop beneath a starry sky">
            <img src="/spacebrew-hero.png" alt="A warmly lit little coffee shop tucked beneath a dusky, starry sky" data-testid="img-hero" />
            <span className="hero-spark one" aria-hidden="true"><Sparkles size={23} /></span>
            <span className="hero-spark two" aria-hidden="true"><Sparkles size={17} /></span>
            <div className="hero-stamp" aria-hidden="true">BREWED FOR<br />THE JOURNEY</div>
          </div>
        </section>

        <div className="ticker" aria-hidden="true">
          <div className="ticker-inner">
            <span>GOOD BEANS, GOOD QUESTS</span><span>SMALL BATCH MAGIC</span><span>YOUR NEXT CUP AWAITS</span><span>GOOD BEANS, GOOD QUESTS</span>
          </div>
        </div>

        <section className="shop-section" id="shop" aria-labelledby="shop-heading">
          <div className="section-inner">
            <div className="section-heading">
              <div><div className="eyebrow">Choose your companion</div><h2 id="shop-heading">The cosmic shelf</h2></div>
              <p>Eight small-batch coffees and four brew-day companions, ready for your next little adventure.</p>
            </div>
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  favorite={favorites.includes(product.id)}
                  quantity={cart[product.id] ?? 0}
                  onFavorite={() => toggleFavorite(product.id)}
                  onAdd={() => addToCart(product.id)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="story" id="about" aria-labelledby="story-heading">
          <div className="story-art" aria-hidden="true">
            <span className="story-sun" />
            <span className="story-moon"><Moon size={90} strokeWidth={1} /></span>
            <div className="story-beans"><span className="bean" /><span className="bean" /><span className="bean" /></div>
          </div>
          <div className="story-copy">
            <div className="eyebrow">A note from our tiny roastery</div>
            <h2 id="story-heading">Every great story starts with a good cup.</h2>
            <p>Cosmic Beans began with a well-loved kettle, a sky full of stars, and the belief that the everyday deserves a little wonder. We roast in small batches, source with care, and save you the first sip.</p>
            <a className="story-link" href="#shop" data-testid="link-story-shop">Find your first favorite <ArrowRight size={15} /></a>
          </div>
        </section>

        <section className="promise-row" aria-label="Our promises">
          <div className="promise">
            <span className="promise-icon"><Sparkles size={20} /></span>
            <h3>Roasted in small batches</h3>
            <p>Fresh little lots, never forgotten at the back of a warehouse.</p>
          </div>
          <div className="promise">
            <span className="promise-icon"><Leaf size={20} /></span>
            <h3>Thoughtful from the start</h3>
            <p>Good relationships with the people and places behind every bean.</p>
          </div>
          <div className="promise">
            <span className="promise-icon"><Moon size={20} /></span>
            <h3>Made for your ritual</h3>
            <p>For sunrise plans, rainy pages, and one more chapter nights.</p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <Brand />
          <span className="footer-note">Magical beans for your daily adventure!</span>
          <a className="footer-top" href="#home" data-testid="link-back-to-top">Back to the stars</a>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return <Home />;
}

export default App;
