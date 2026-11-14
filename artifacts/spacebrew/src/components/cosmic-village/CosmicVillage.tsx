import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowLeft, ArrowRight, Bean, Heart, Leaf, Moon, ShoppingBag, Sparkles, UserRound, X } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import AccountDialog from './AccountDialog';
import { supabase } from '@/lib/supabase';

type ProductBase = {
  id: string;
  name: string;
  origin: string;
  description: string;
  price: number;
  tone: string;
};
type Product =
  | (ProductBase & { category: 'coffee' })
  | (ProductBase & { category: 'gear'; image: string });

const formatKwd = (amount: number) => `KWD ${amount.toFixed(3)}`;
const products: Product[] = [
  { id: 'moonbeam', name: 'Moonbeam Blend', origin: 'THE NIGHT OWL', description: 'Dark chocolate, toasted hazelnut, a little midnight magic.', price: 5.5, tone: 'peach', category: 'coffee' },
  { id: 'sunspell', name: 'Sunspell Roast', origin: 'THE BRIGHT SIDE', description: 'Apricot jam and honey for first-light kind of mornings.', price: 5.75, tone: 'blue', category: 'coffee' },
  { id: 'stardust', name: 'Stardust Decaf', origin: 'THE SLOW SPELL', description: 'Soft cocoa and sweet orange. All the ritual, no rush.', price: 5.25, tone: 'yellow', category: 'coffee' },
  { id: 'comet', name: 'Comet Chaser', origin: 'THE WANDERER', description: 'Juicy berries and caramel with a bright little kick.', price: 6, tone: 'rose', category: 'coffee' },
  { id: 'cloudberry', name: 'Cloudberry Daybreak', origin: 'THE EARLY RISER', description: 'Sweet citrus, almond, and a soft golden finish.', price: 5.75, tone: 'yellow', category: 'coffee' },
  { id: 'cinder', name: 'Cinder & Cinnamon', origin: 'THE FIRESIDE', description: 'Brown sugar, warm spice, and a crackling cocoa note.', price: 5.5, tone: 'peach', category: 'coffee' },
  { id: 'blue-hour', name: 'Blue Hour Espresso', origin: 'THE NIGHT FLIGHT', description: 'A syrupy double-shot blend with plum and dark caramel.', price: 6.5, tone: 'blue', category: 'coffee' },
  { id: 'honey-orbit', name: 'Honey Orbit', origin: 'THE DAYDREAMER', description: 'Floral honey, ripe pear, and a mellow tea-like finish.', price: 6, tone: 'rose', category: 'coffee' },
  { id: 'moon-phase-mug', name: 'Moon Phase Mug', origin: 'HAND-THROWN CERAMIC', description: 'A midnight-blue mug with a little gold moon inside.', price: 5.5, tone: 'blue', category: 'gear', image: '/moon-phase-mug.webp' },
  { id: 'orbit-travel-cup', name: 'Orbit Travel Cup', origin: 'REUSABLE · DOUBLE-WALL', description: 'A cozy, spill-resistant cup for coffee on the move.', price: 8, tone: 'rose', category: 'gear', image: '/orbit-travel-cup.webp' },
  { id: 'comet-hand-grinder', name: 'Comet Hand Grinder', origin: 'BURR GRINDER', description: 'A compact hand grinder for fresh grounds anywhere.', price: 13.5, tone: 'peach', category: 'gear', image: '/comet-hand-grinder.webp' },
  { id: 'stardust-pour-over', name: 'Stardust Pour-Over Set', origin: 'CERAMIC DRIPPER', description: 'A slow-brew dripper and reusable filter for easy mornings.', price: 10, tone: 'yellow', category: 'gear', image: '/stardust-pour-over.webp' },
];

type Recipe = { id: string; dose: string; yield: string; time: string; temp: string; grind: string; taste: string; method: string; pageTwo: string };
const recipes: Recipe[] = [
  { id: 'moonbeam', dose: '18 g', yield: '36 g', time: '28–32 sec', temp: '92°C', grind: 'Fine; aim for a steady, syrupy stream.', taste: 'Too sharp? Raise the temperature 1°C. Too heavy? Stop the shot a touch earlier.', method: 'A gentle pre-infusion helps the chocolate notes open without rushing the shot.', pageTwo: 'Look for a deep hazelnut aroma and a rounded finish. Let the basket dry fully before dosing.' },
  { id: 'sunspell', dose: '18 g', yield: '40 g', time: '27–31 sec', temp: '93°C', grind: 'Fine, just loose enough for a lively flow.', taste: 'If apricot turns tart, grind a little finer; if honey disappears, shorten the yield.', method: 'Keep the first few seconds even; this bright roast rewards a calm, level puck.', pageTwo: 'Expect apricot and soft florals. A slightly longer ratio brings out more honeyed sweetness.' },
  { id: 'stardust', dose: '18 g', yield: '38 g', time: '29–33 sec', temp: '92°C', grind: 'Fine-medium; decaf often prefers a small step finer.', taste: 'Thin or hollow? Add 1°C and tighten the grind. Bitter? Open the grind slightly.', method: 'Use a slow, even ramp into pressure; decaf can extract quickly once the flow begins.', pageTwo: 'Cocoa should lead, with orange at the edge. Keep the cup warm to preserve its gentle sweetness.' },
  { id: 'comet', dose: '18 g', yield: '42 g', time: '26–30 sec', temp: '93°C', grind: 'Fine; adjust for an even, quick-bright stream.', taste: 'If berries feel sour, grind finer. If caramel gets dry, lower temperature 1°C.', method: 'A touch more beverage yield lets the berry character shine without losing body.', pageTwo: 'Taste for juicy berry first, then caramel. Stir the espresso before judging its balance.' },
  { id: 'cloudberry', dose: '18 g', yield: '38 g', time: '28–32 sec', temp: '93°C', grind: 'Fine and consistent, with a clean finish to the flow.', taste: 'For more almond sweetness, lengthen by 2 g; for more citrus, shorten the shot.', method: 'Keep distribution tidy: the citrus is delicate and benefits from an even extraction.', pageTwo: 'A golden crema and sweet citrus aroma are good signs. Avoid letting the shot run blond.' },
  { id: 'cinder', dose: '18 g', yield: '36 g', time: '29–33 sec', temp: '92°C', grind: 'Fine; lean slightly finer for a cozy, dense body.', taste: 'If spice feels dry, lower temperature 1°C. If brown sugar is muted, grind finer.', method: 'A shorter ratio keeps the brown-sugar body plush and the cinnamon note warm.', pageTwo: 'Look for cocoa and brown sugar in the finish. Pair with a small, pre-warmed cup.' },
  { id: 'blue-hour', dose: '19 g', yield: '38 g', time: '27–31 sec', temp: '92°C', grind: 'Fine; aim for a thick, unbroken ribbon.', taste: 'If plum tastes sharp, add 2 g yield. If caramel is bitter, coarsen a small step.', method: 'The slightly larger dose is built for a syrupy double shot; distribute carefully.', pageTwo: 'A glossy texture signals a good start. Let the shot settle for a few seconds before sipping.' },
  { id: 'honey-orbit', dose: '18 g', yield: '40 g', time: '27–31 sec', temp: '92°C', grind: 'Fine-medium for a soft, even extraction.', taste: 'Want more pear? Lengthen 2 g. Want more floral honey? Nudge finer.', method: 'Keep temperature modest to preserve the delicate floral and tea-like character.', pageTwo: 'The finish should feel light and sweet. A small ceramic cup makes the aroma easier to catch.' },
];

function Brand() {
  return <a className="brand" href="#home" aria-label="Cosmic Beans home" data-testid="link-brand-home"><span className="brand-mark"><Bean size={21} /></span><span className="brand-name">Cosmic<span> Beans</span></span></a>;
}

function ProductCard({ product, favorite, quantity, onFavorite, onAdd }: { product: Product; favorite: boolean; quantity: number; onFavorite: () => void; onAdd: () => void }) {
  const [added, setAdded] = useState(false);
  const addItem = () => { onAdd(); setAdded(true); window.setTimeout(() => setAdded(false), 1100); };
  return (
    <article className="product-card" data-testid={`card-product-${product.id}`}>
      <div className="product-visual" data-tone={product.tone} data-testid={`visual-product-${product.id}`}>
        <button type="button" className={`favorite${favorite ? ' is-favorite' : ''}`} onClick={onFavorite} aria-label={favorite ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`} aria-pressed={favorite} data-testid={`button-favorite-${product.id}`}><Heart size={17} fill={favorite ? 'currentColor' : 'none'} /></button>
        {product.category === 'coffee' ? <div className="coffee-package">
          <img src="/cosmic-beans-pouch.png" alt="" className="coffee-package-image" />
          <span className="coffee-package-label"><b>COSMIC<br />BEANS</b><small>{product.name}</small></span>
        </div> : <img src={product.image} alt={product.name} className="merch-image" />}
        {quantity > 0 && <span className="cart-live" data-testid={`status-quantity-${product.id}`}>In your bag: {quantity}</span>}
      </div>
      <div className="product-info">
        <div className="product-tag">{product.origin}</div>
        <h3 className="product-name" data-testid={`text-product-name-${product.id}`}>{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-bottom"><span className="price" data-testid={`text-product-price-${product.id}`}>{formatKwd(product.price)}</span><button type="button" onClick={addItem} className={`add-button${added ? ' added' : ''}`} data-testid={`button-add-${product.id}`} aria-label={`Add ${product.name} to cart`}>{added ? 'Added to bag' : <>Add to Bag <ArrowRight size={14} /></>}</button></div>
      </div>
    </article>
  );
}

function RecipeBooklet() {
  const [selected, setSelected] = useState(recipes[0].id);
  const [page, setPage] = useState(0);
  const recipe = recipes.find((item) => item.id === selected) ?? recipes[0];
  const product = products.find((item) => item.id === selected);
  return <section className="brew-guide" id="brew-guide" aria-labelledby="brew-heading">
    <div className="brew-guide-inner">
      <div className="brew-intro"><div className="eyebrow">Luma's espresso field notes</div><h2 id="brew-heading">Find your shot in the stars.</h2><p>Every roast has its own rhythm. Choose a bag, turn the page, and use these starting points to dial in your home espresso.</p><span className="booklet-edition">VOLUME 01 <i /> EIGHT ROASTS</span></div>
      <div className="brew-book">
        <div className="recipe-selector" aria-label="Choose a coffee roast">
          {recipes.map((item, index) => <button type="button" key={item.id} onClick={() => { setSelected(item.id); setPage(0); }} aria-pressed={selected === item.id} data-testid={`button-recipe-roast-${item.id}`}>{String(index + 1).padStart(2, '0')} <span>{products.find((p) => p.id === item.id)?.name}</span></button>)}
        </div>
        <div className="recipe-page" data-testid={`panel-recipe-${recipe.id}`}>
          <div className="recipe-head"><div><span className="product-tag">ESPRESSO STARTING POINT · {product?.origin}</span><h3>{product?.name}</h3></div><span className="page-mark">0{page + 1} / 02</span></div>
          {page === 0 ? <>
            <div className="recipe-metrics"><div><small>DOSE</small><strong>{recipe.dose}</strong></div><div><small>IN THE CUP</small><strong>{recipe.yield}</strong></div><div><small>TARGET TIME</small><strong>{recipe.time}</strong></div><div><small>WATER</small><strong>{recipe.temp}</strong></div></div>
            <div className="recipe-note"><span className="note-icon"><Sparkles size={16} /></span><div><b>Grind cue</b><p>{recipe.grind}</p></div></div>
            <div className="recipe-tip"><span>IF THE CUP NEEDS A NUDGE</span><p>{recipe.taste}</p></div>
          </> : <div className="recipe-method"><span className="method-kicker">LUMA'S MARGIN NOTES</span><h4>Keep the ritual, adjust the details.</h4><p>{recipe.method}</p><p>{recipe.pageTwo}</p><div className="method-rule"><span>01</span><span>Weigh in · distribute evenly · taste warm</span></div></div>}
          <div className="recipe-controls"><button type="button" onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={page === 0} aria-label="Turn to previous recipe page" data-testid="button-recipe-previous"><ArrowLeft size={15} /> Previous</button><span aria-live="polite">PAGE {page + 1} OF 2</span><button type="button" onClick={() => setPage((current) => Math.min(1, current + 1))} disabled={page === 1} aria-label="Turn to next recipe page" data-testid="button-recipe-next">Next page <ArrowRight size={15} /></button></div>
        </div>
      </div>
    </div>
  </section>;
}

function CosmicVillage() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const cartProducts = products.filter((product) => cart[product.id]);
  const subtotal = cartProducts.reduce((sum, product) => sum + product.price * cart[product.id], 0);
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null);
    });
    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error('Could not restore the customer session.', error);
      if (active) setUser(data.session?.user ?? null);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);
  const toggleFavorite = (id: string) => setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const addToCart = (id: string) => setCart((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 }));
  const closeMenu = () => setMenuOpen(false);
  return <div className="site-shell" id="home">
    <div className="offer-banner" role="note" data-testid="banner-new-customer-offer"><span className="offer-label">A FIRST VISIT GIFT</span><strong>Take 10% off your first order</strong><a href="#shop" data-testid="link-offer-shop">Find your roast <ArrowRight size={13} /></a></div>
    <div className="topline"><span className="topline-star">✦</span> Freshly roasted under a very good moon <span className="topline-star">✦</span></div>
    <header className="nav-wrap"><nav className="nav" aria-label="Main navigation">
      <Brand />
      <button type="button" className="menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} data-testid="button-menu-toggle"><span /><span /></button>
      <div className={`nav-links${menuOpen ? ' is-open' : ''}`}>
        <a href="#home" onClick={closeMenu} data-testid="link-home">Home</a><a href="#beans" onClick={closeMenu} data-testid="link-shop">Coffee</a><a href="#merchandise" onClick={closeMenu} data-testid="link-merchandise">Merch</a><a href="#brew-guide" onClick={closeMenu} data-testid="link-brew-guide">Espresso notes</a><a href="#about" onClick={closeMenu} data-testid="link-about">Our story</a>
        <button type="button" className="nav-account-link" onClick={() => { closeMenu(); setAccountOpen(true); }} data-testid="button-account-open"><UserRound size={14} /><span>{user ? 'My account' : 'Sign up'}</span></button>
      </div>
      <button type="button" className="cart-button" onClick={() => setCartOpen((open) => !open)} aria-expanded={cartOpen} aria-controls="cart-panel" data-testid="button-cart"><ShoppingBag size={17} /><span>Bag</span><span className="cart-count" data-testid="text-cart-count" aria-live="polite">{cartCount}</span></button>
      <span className="cart-live" aria-live="polite" data-testid="status-cart-live">{cartCount === 1 ? '1 item in your bag' : `${cartCount} items in your bag`}</span>
    </nav>
    {cartOpen && <aside className="cart-panel" id="cart-panel" aria-label="Your shopping bag" data-testid="panel-cart">
      <div className="cart-panel-head"><div><span className="product-tag">YOUR LITTLE STASH</span><h2>Your bag</h2></div><button type="button" className="cart-close" onClick={() => setCartOpen(false)} aria-label="Close bag" data-testid="button-close-cart"><X size={18} /></button></div>
      {cartProducts.length ? <><div className="cart-lines">{cartProducts.map((product) => <div className="cart-line" key={product.id} data-testid={`row-cart-${product.id}`}><span className={`cart-swatch ${product.tone}`} /><span className="cart-line-name">{product.name}<small>Qty {cart[product.id]}</small></span><span className="cart-line-price">{formatKwd(product.price * cart[product.id])}</span></div>)}</div><div className="cart-subtotal"><span>Subtotal</span><strong>{formatKwd(subtotal)}</strong></div><p className="cart-note"><strong>Checkout preview — not available.</strong> This little bag is just a storefront demo.</p></> : <div className="cart-empty"><span className="empty-moon"><Moon size={23} /></span><strong>Your bag is taking a nap.</strong><span>Let’s find it something lovely.</span><a href="#shop" onClick={() => setCartOpen(false)} data-testid="link-cart-shop">Explore the shop <ArrowRight size={14} /></a></div>}
    </aside>}
    </header>
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy"><div className="eyebrow">A tiny roastery for dreamers</div><h1 id="hero-title">A little <em>moonlight</em> in your morning.</h1><p className="hero-lead">Small-batch coffee for home espresso brewers, late-night readers, and anyone who likes their everyday with a little wonder.</p><a className="hero-cta" href="#beans" data-testid="button-shop-now">Meet the beans <ArrowDownRight size={17} /></a><div className="hero-note"><span>ROASTED IN SMALL LOTS</span><i /> SENT WITH STARDUST</div></div>
        <div className="hero-art"><img className="hero-village" src="/cosmic-midnight-village.webp" alt="A hand-painted village of warm café windows beneath a deep blue starry sky" data-testid="img-hero" /><div className="hero-shade" /><img className="hero-mascot" src="/luma-witch-mascot.webp" alt="Luma, Cosmic Beans' original roastery witch, in her star-embroidered cloak and pointed hat" data-testid="img-luma" /><span className="hero-spark one"><Sparkles size={20} /></span><span className="hero-spark two"><Sparkles size={15} /></span><div className="hero-stamp"><span>THE VILLAGE<br />IS OPEN</span><Moon size={17} /></div><div className="luma-card"><span>YOUR ROASTING GUIDE</span><strong>Meet Luma</strong><small>She saved you a seat.</small></div><div className="hero-caption"><span>01 / 04</span> Somewhere between the stars and home</div></div>
      </section>
      <div className="ticker" aria-hidden="true"><div className="ticker-inner"><span>GOOD BEANS, GOOD QUESTS</span><span>SMALL BATCH MAGIC</span><span>YOUR NEXT CUP AWAITS</span><span>GOOD BEANS, GOOD QUESTS</span></div></div>
      <section className="shop-section" id="shop"><div className="section-inner">
        <section className="catalog-section" id="beans" aria-labelledby="beans-heading"><div className="section-heading"><div><div className="eyebrow">Fresh from the roastery</div><h2 id="beans-heading">Coffee for your orbit</h2></div><p>Eight little worlds to choose from. Each one roasted for the quiet magic of a really good cup.</p></div><div className="product-grid">{products.filter((product) => product.category === 'coffee').map((product) => <ProductCard key={product.id} product={product} favorite={favorites.includes(product.id)} quantity={cart[product.id] ?? 0} onFavorite={() => toggleFavorite(product.id)} onAdd={() => addToCart(product.id)} />)}</div></section>
        <section className="catalog-section merch-section" id="merchandise" aria-labelledby="merch-heading"><div className="section-heading"><div><div className="eyebrow">Tools for the ritual</div><h2 id="merch-heading">Keep the magic close</h2></div><p>Thoughtful celestial tools, made to earn a place on your counter or in your bag.</p></div><div className="product-grid merch-grid">{products.filter((product) => product.category === 'gear').map((product) => <ProductCard key={product.id} product={product} favorite={favorites.includes(product.id)} quantity={cart[product.id] ?? 0} onFavorite={() => toggleFavorite(product.id)} onAdd={() => addToCart(product.id)} />)}</div></section>
      </div></section>
      <RecipeBooklet />
      <section className="story" id="about" aria-labelledby="story-heading"><div className="story-art"><img src="/cosmic-midnight-village.webp" alt="" /><div className="story-moon"><Moon size={31} /></div><div className="story-art-label"><span>FROM OUR LITTLE CORNER</span><strong>Under the same sky.</strong></div></div><div className="story-copy"><div className="eyebrow">A note from our tiny roastery</div><h2 id="story-heading">Every great story starts with a good cup.</h2><p>Cosmic Beans began with a well-loved kettle, a sky full of stars, and the belief that the everyday deserves a little wonder. Luma keeps watch over the roaster; we source with care, roast in small batches, and save you the first sip.</p><a className="story-link" href="#shop" data-testid="link-story-shop">Find your first favorite <ArrowRight size={15} /></a></div></section>
      <section className="promise-row" aria-label="Our promises"><div className="promise"><span className="promise-icon"><Sparkles size={19} /></span><h3>Roasted in small batches</h3><p>Fresh little lots, never forgotten at the back of a warehouse.</p></div><div className="promise"><span className="promise-icon"><Leaf size={19} /></span><h3>Thoughtful from the start</h3><p>Good relationships with the people and places behind every bean.</p></div><div className="promise"><span className="promise-icon"><Moon size={19} /></span><h3>Made for your ritual</h3><p>For sunrise plans, rainy pages, and one more chapter nights.</p></div></section>
    </main>
    <footer className="footer"><div className="footer-inner"><Brand /><span className="footer-note">Magical beans for your daily adventure · Kuwait</span><a className="footer-top" href="#home" data-testid="link-back-to-top">Back to the stars</a></div></footer>
     <AccountDialog open={accountOpen} onOpenChange={setAccountOpen} user={user} />
  </div>;
}

export default CosmicVillage;
