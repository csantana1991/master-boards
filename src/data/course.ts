import { PREP_QUESTIONS } from "@/data/prep";

export type Equation = { label: string; text: string };

export type Module = {
  id: string;
  index: string;
  code: string;
  title: string;
  sitting: string;
  labId?: string;
  summary: string;
  objectives?: string[];
  extract?: string;
  paragraphs: string[];
  equations: Equation[];
  exampleTitle: string;
  example: string[];
};

export type LabInfo = {
  id: string;
  index: string;
  title: string;
  moduleId: string;
  blurb: string;
};

export type Question = {
  id: string;
  moduleId: string;
  prompt: string;
  choices: string[];
  answer: number;
  explanation: string;
};

export type Track = {
  id: string;
  code: string;
  title: string;
  focus: string;
  paragraphs: string[];
  electives: { title: string; body: string }[];
  caseTitle: string;
  case: string[];
  reveal: string[];
  widget?: "carbon" | "bnpl";
};

export type Brief = {
  id: string;
  sponsor: string;
  title: string;
  ask: string;
  reveal: string[];
};

export const LABS: LabInfo[] = [
  {
    id: "gbm",
    index: "01",
    title: "Geometric Brownian motion",
    moduleId: "stochastic",
    blurb: "Exact and Euler schemes, fan chart, VaR, expected shortfall, and a risk-neutral call.",
  },
  {
    id: "dcf",
    index: "02",
    title: "FCFF valuation",
    moduleId: "accounting",
    blurb: "Five-year free cash flow, Gordon terminal value, and the Dixit–Pindyck option to wait.",
  },
  {
    id: "capm",
    index: "03",
    title: "Mean–variance frontier",
    moduleId: "markets",
    blurb: "Tangency portfolio, global minimum variance, and CAPM alphas against that tangency book.",
  },
  {
    id: "bl",
    index: "04",
    title: "Black–Litterman",
    moduleId: "portfolio",
    blurb: "Equilibrium returns, two investor views, and fully invested posterior weights.",
  },
  {
    id: "binomial",
    index: "05",
    title: "Binomial tree and Black–Scholes",
    moduleId: "derivatives",
    blurb: "CRR risk-neutral tree, American exercise, closed-form Greeks, put–call parity.",
  },
  {
    id: "analytics",
    index: "06",
    title: "Cross-section and execution",
    moduleId: "analytics",
    blurb: "A noisy beta regression, then Almgren–Chriss liquidation against TWAP.",
  },
];

export const MODULES: Module[] = [
  {
    id: "foundations",
    index: "01",
    code: "Core",
    title: "Foundations of modern finance",
    sitting: "One sitting",
    labId: "dcf",
    summary: "Price is the cost of a replicating claim. NPV is that statement applied to a project.",
    objectives: [
      "State the law of one price and the arbitrage it forbids.",
      "Write a pricing kernel and the risk-neutral special case.",
      "Compute NPV and explain why IRR is not a decision rule.",
      "Separate financing effects from operating cash flows.",
    ],
    paragraphs: [
      "A price is not a story about the future. It is the amount of cash that replicates a set of state-contingent payoffs. If two portfolios pay the same amount in every state and trade at different prices, buy the cheap one, sell the expensive one, and pocket a positive cash amount today with nothing owed tomorrow. That is arbitrage. Every later model in this desk — binomial trees, Black–Scholes, WACC — is a restriction that makes this trade impossible.",
      "Under complete markets there is a positive state-price vector. Equivalently there is a positive pricing kernel m such that the price of a payoff x is p = E[m x]. Risk aversion lives inside m: bad states get a larger kernel, so claims that pay there are expensive. Change measure to the risk-neutral probability Q and the same price is the risk-free discount of an expectation, p = e^{−rT} E^Q[x]. Q is not what you believe. It is P reweighted by marginal utility, normalized into a probability.",
      "A corporate project is the same object. Forecast the incremental cash the firm can pay to capital, discount at the opportunity cost of capital that matches the risk, and subtract the outlay. NPV is the arbitrage-free value of taking the project. IRR is a root of that polynomial. It can have several roots, it ignores scale, and it assumes intermediate cash is reinvested at the IRR. You may quote it. You do not decide with it when it disagrees with NPV.",
      "Keep financing out of the operating forecast unless you are doing APV on purpose. Discount free cash flow to the firm at WACC, or free cash flow to equity at the cost of equity. Mixing a cash flow that belongs to both debt and equity with a discount rate that belongs only to equity is the most common valuation error on this board.",
    ],
    equations: [
      { label: "Pricing kernel", text: "p = E[m · x]" },
      { label: "Risk-neutral form", text: "p = e^(−rT) · E^Q[x]" },
      { label: "Net present value", text: "NPV = −I + Σ CF_t / (1+r)^t" },
    ],
    exampleTitle: "A two-date project",
    example: [
      "Outlay 100 today. Cash 55 in one year and 60 in two. Opportunity cost 8%.",
      "PV = 55 / 1.08 + 60 / 1.08² = 50.93 + 51.44 = 102.37.",
      "NPV = 2.37. Take it. The IRR is a bit over 8% and agrees here only because the cash flows change sign once.",
    ],
  },
  {
    id: "stochastic",
    index: "02",
    code: "15.450",
    title: "Stochastic calculus and Monte Carlo",
    sitting: "One sitting",
    labId: "gbm",
    summary: "Brownian increments square to time. That single fact is Itô’s lemma.",
    extract:
      "Welcome to MIT 15.450. Ordinary calculus assumes smooth, differentiable trajectories. Financial asset prices are random processes driven by Brownian shocks. When writing the stochastic differential equation: dS_t = mu*S_t*dt + sigma*S_t*dW_t, standard Taylor expansion fails because (dW_t)^2 = dt. Itô's Lemma gives us: df(S_t, t) = (df/dt + mu*S*(df/dS) + 0.5*sigma^2*S^2*(d^2f/dS^2))dt + sigma*S*(df/dS)dW_t.",
    paragraphs: [
      "A Wiener process W has independent Gaussian increments, continuous paths, and variance equal to elapsed time. The product (dW)² is not second order in the usual sense. Over a partition it sums to the length of the interval, so in the stochastic differential we replace (dW)² with dt and drop dt·dW. Apply that replacement to a smooth f(S, t) and the second derivative of f survives in the drift. That extra term is the entire difference between ordinary calculus and Itô calculus.",
      "Take f = log S and the geometric Brownian motion in the extract. Then ∂f/∂S = 1/S and ∂²f/∂S² = −1/S². The second-order piece is ½ σ² S² (−1/S²) = −½ σ². The drift of the log is therefore μ − ½ σ², not μ. Integrate and you have the exact solution: log(S_T / S_0) is normal with that mean and variance σ² T. The level S_T is lognormal. Its mean is S_0 e^{μT}. Its median is S_0 e^{(μ − ½σ²)T}. The mean sits above the median because the right tail is long. Confusing the two is how people overstate a typical path.",
      "Monte Carlo is the law of large numbers applied to that solution. Draw Z ~ N(0,1), set S_T = S_0 exp((μ − ½σ²)T + σ √T Z), and average a function of S_T. The standard error of the mean is the sample standard deviation over √N. Cutting the error in half costs four times the paths. Antithetic pairs, Z and −Z, leave the estimator unbiased for a symmetric shock and usually shrink the variance. They do not repair a biased scheme.",
      "Euler–Maruyama steps the SDE directly: S ← S (1 + μ dt + σ √dt Z). On a fine grid it is close. On a coarse grid a convex payoff — a call — feels the missing Itô correction. If you only need S_T under GBM, simulate the exact transition. Save the grid for path-dependent claims: barriers, Asians, American exercise, where no closed transition of the payoff exists.",
    ],
    equations: [
      { label: "GBM", text: "dS = μ S dt + σ S dW" },
      { label: "Itô correction on the log", text: "d log S = (μ − ½ σ²) dt + σ dW" },
      { label: "Exact transition", text: "S_T = S_0 exp( (μ − ½σ²)T + σ √T Z )" },
      { label: "Monte Carlo error", text: "SE = s / √N" },
      { label: "Repository tail loss", text: "VaR_spot = S_0 − q_0.05(S_T)    ES = E[S_T | S_T ≤ q_0.05]" },
    ],
    exampleTitle: "One-year book, repository parameters",
    example: [
      "S_0 = 100, μ = 8%, σ = 20%, T = 1.",
      "Analytic mean = 100 e^{0.08} = 108.33. Analytic median = 100 e^{0.06} = 106.18.",
      "The 5% lognormal quantile uses z_0.05 ≈ −1.645. Terminal price ≈ 100 exp(0.06 − 0.32897) ≈ 76.41. Spot-minus-that-quantile, the repository’s VaR print, is about 23.59. A 50,000-path book should land near these numbers, inside a standard error, not on top of a story.",
    ],
  },
  {
    id: "accounting",
    index: "03",
    code: "Core",
    title: "Corporate financial accounting",
    sitting: "One sitting",
    labId: "dcf",
    summary: "Earnings are an opinion. Free cash flow is what capital can actually take.",
    paragraphs: [
      "Accrual accounting matches effort to revenue. Cash does not care. A valuation model needs the cash a firm can distribute without starving the assets that produce the next period’s cash. Start from the statements, but do not stop at net income.",
      "EBIT is operating profit after depreciation. Tax it at the marginal rate as if the firm were unlevered — interest belongs in the discount rate or in an APV shield, not in both. NOPAT = EBIT (1 − t). Depreciation was subtracted inside EBIT and is not cash, so add the full depreciation back. Do not multiply it by (1 − t) a second time. The shield is already inside NOPAT, because taxable income was lower by the depreciation charge.",
      "Then subtract what the business must reinvest. Capital expenditure is the cash spent to replace and grow the asset base. The change in net working capital is the cash absorbed by receivables and inventory beyond payables. An increase in NWC is a use of cash. Free cash flow to the firm is the residual: FCFF = NOPAT + depreciation − capex − ΔNWC.",
      "FCFF belongs to debt and equity together, so discount it at WACC. Free cash flow to equity is what is left for shareholders after interest and net borrowing: FCFE ≈ FCFF − interest (1 − t) + net borrowing. Discount FCFE at the cost of equity. The enterprise value from FCFF, minus net debt, is the equity value. Divide by diluted shares only after you believe the share count.",
    ],
    equations: [
      { label: "NOPAT", text: "NOPAT = EBIT (1 − t)" },
      { label: "Free cash flow to the firm", text: "FCFF = NOPAT + D&A − capex − ΔNWC" },
      { label: "Bridge to equity cash flow", text: "FCFE ≈ FCFF − interest(1 − t) + net borrowing" },
      { label: "Terminal value", text: "TV_N = FCFF_N (1+g) / (WACC − g) ,   WACC > g" },
    ],
    exampleTitle: "A clean year",
    example: [
      "Revenue 1,060. EBIT margin 18%, so EBIT = 190.8. Tax 21%, NOPAT = 150.7.",
      "Depreciation 4% of sales = 42.4. Capex 5% = 53.0. Net working capital rises by 6.",
      "FCFF = 150.7 + 42.4 − 53.0 − 6 = 134.1. That is the number that enters the discounting, not the 190.8 and not net income.",
    ],
  },
  {
    id: "computing",
    index: "04",
    code: "Core",
    title: "Programming and computational methods",
    sitting: "One sitting",
    labId: "gbm",
    summary: "Vectorize the paths. Know the bias of the scheme. Report the standard error.",
    paragraphs: [
      "The repository’s Monte Carlo is four lines because the work is a matrix, not a story. Draw a panel of standard normals with shape (steps, paths). The return increment is a broadcast of the drift and a broadcast of the shock. Cumulative sum down time, exponentiate, scale by S_0. A Python loop over paths is the same mathematics and a worse use of the machine. In the browser the desk does the same arithmetic in typed loops. The printout should match.",
      "Two schemes are not the same estimator. The exact GBM map uses the log-transition and is unbiased for any function of S_T, at any step count, because it never discretizes. Euler–Maruyama is a first-order scheme. Its weak error on a smooth payoff shrinks with the step, not with the number of paths. More paths make you confidently wrong. When you compare schemes, hold the seed fixed — common random numbers — so the difference is the scheme, not a fresh draw.",
      "Always print the standard error next to the estimate. A call priced at 10.50 ± 0.40 is not a disagreement with Black–Scholes at 10.45. A call priced at 10.50 ± 0.02 on a one-step Euler grid is a bias. Antithetic variates cut noise. They are not a smaller time step.",
      "For a European claim under GBM you should not be simulating under the physical drift μ at all. Pricing uses the risk-neutral drift r. μ is for risk, capital, and the repository’s VaR print. Mixing the two — a real-world drift inside a discounted payoff — is a quiet way to misprice an option by the entire risk premium.",
    ],
    equations: [
      { label: "Exact one-step map", text: "S ← S · exp( (μ − ½σ²) dt + σ √dt Z )" },
      { label: "Euler map", text: "S ← S · ( 1 + μ dt + σ √dt Z )" },
      { label: "Risk-neutral call", text: "C = e^(−rT) E^Q[ max(S_T − K, 0) ]" },
      { label: "Paths for half the error", text: "N → 4N    cuts SE by half" },
    ],
    exampleTitle: "What the repository function prints",
    example: [
      "run_gbm_simulation uses the exact log-Euler accumulation, which is exact GBM, under the physical drift. It reports the mean terminal price and S_0 minus the 5th percentile.",
      "It does not report a standard error, and it does not price an option. Add both before you trust a book. The lab does.",
    ],
  },
  {
    id: "corporate",
    index: "05",
    code: "Core",
    title: "Corporate finance",
    sitting: "One sitting",
    labId: "dcf",
    summary: "Capital structure changes who is paid. Taxes and the option to wait change what the firm is worth.",
    paragraphs: [
      "With no taxes, no costs of distress, and no asymmetric information, Modigliani and Miller are blunt: the mix of debt and equity does not change the value of the firm. Debt is cheaper than equity. It is cheaper because it is safer, and making debt safer makes equity riskier by the same present value. WACC does not fall when you lever up, in that world. It is invariant.",
      "A corporate tax that deducts interest breaks the invariance. The tax shield is worth approximately t_c D if the debt is permanent and riskless as a tax object. WACC then uses the after-tax cost of debt: WACC = (E/V) r_E + (D/V) r_D (1 − t_c). Adjusted present value says the same thing in two layers: value the unlevered free cash flow at the unlevered cost of capital, then add the present value of shields and subtract distress costs you can actually defend.",
      "Irreversible investment is an option, not a now-or-never NPV. A project that pays a cash-flow yield can be worth more alive and unexercised than exercised, because exercising kills the option to wait for a better state. In the Dixit–Pindyck perpetual model the trigger value is V* = [β / (β − 1)] I, where β > 1 solves the fundamental quadratic. The markup β/(β−1) is larger when volatility is larger and when the cash-flow yield is smaller. Positive NPV is not sufficient. You invest when value clears V*, not when it clears I.",
      "Working-capital policy, payout, and security design are the same idea at lower volume: move cash to the claimholder who values it, after tax and after the information you reveal by the move. A dividend and a repurchase are not the same signal. A rights issue and a private placement are not the same dilution.",
    ],
    equations: [
      { label: "After-tax WACC", text: "WACC = (E/V) r_E + (D/V) r_D (1 − t_c)" },
      { label: "APV", text: "V_L = V_U + PV(tax shields) − PV(distress)" },
      { label: "Investment trigger", text: "V* = [β / (β − 1)] · I ,   β > 1" },
    ],
    exampleTitle: "WACC arithmetic",
    example: [
      "Equity 60, debt 40, so V = 100. Cost of equity 10%, cost of debt 5%, tax 21%.",
      "WACC = 0.60 · 0.10 + 0.40 · 0.05 · (1 − 0.21) = 0.060 + 0.0158 = 7.58%.",
      "Using 8% because it is a round blend of 10 and 5 overstates the hurdle and will reject thin positive-NPV projects.",
    ],
  },
  {
    id: "markets",
    index: "06",
    code: "Core",
    title: "Financial markets",
    sitting: "One sitting",
    labId: "capm",
    summary: "Mean–variance investors hold the tangency portfolio. CAPM is that fact, priced.",
    paragraphs: [
      "A mean–variance investor with a risk-free asset splits wealth between the risk-free bill and one risky portfolio: the tangency portfolio of the risky frontier. That is two-fund separation. If every investor sees the same means and the same covariance and can borrow at the same rate, the tangency portfolio is the market portfolio of risky assets. Expected excess return is then linear in beta on that market. CAPM is not a regression you hope fits. It is an equilibrium restriction: E[r_i] − r_f = β_i (E[r_m] − r_f), with β_i = Cov(r_i, r_m) / Var(r_m).",
      "The frontier itself does not need a risk-free asset. Fully invested portfolios trace a hyperbola in mean–standard-deviation space. The leftmost point is the global minimum-variance portfolio, w ∝ Σ^{−1} 1. The tangency portfolio, when a risk-free rate exists, is w ∝ Σ^{−1} (μ − r_f 1), renormalized to sum to one. Short sales fall out of the linear algebra. If your mandate forbids them, you are solving a different problem and CAPM does not describe your corner.",
      "Arbitrage pricing theory weakens the demand that the market portfolio be efficient. In a factor model, a well-diversified portfolio’s idiosyncratic risk is negligible, so only factor betas are priced. Expected return is linear in those betas. APT does not tell you the factors. Empirics propose them — market, size, value, profitability, investment, momentum — and then the joint hypothesis shows up: a rejection is either a bad model or a market that was not efficient on that sample.",
      "Performance measurement inherits the same joint hypothesis. Jensen’s alpha is the intercept of excess return on the benchmark. The Sharpe ratio is mean excess over volatility and ranks total portfolios, not pieces of them. The information ratio ranks active return against tracking error. A large in-sample alpha after you have tried many specifications is not yet a track record.",
    ],
    equations: [
      { label: "CAPM", text: "E[r_i] = r_f + β_i ( E[r_m] − r_f )" },
      { label: "Beta", text: "β_i = Cov(r_i, r_m) / Var(r_m)" },
      { label: "Tangency weights", text: "w ∝ Σ^(−1) (μ − r_f 1) ,   then 1'w = 1" },
      { label: "Jensen", text: "r_i − r_f = α_i + β_i (r_m − r_f) + ε_i" },
    ],
    exampleTitle: "A single-name expected return",
    example: [
      "Risk-free rate 3%. Market excess return 5%. Beta 1.4.",
      "CAPM expected return = 0.03 + 1.4 · 0.05 = 10%.",
      "If your analyst forecast is 12%, the CAPM alpha is 2 percentage points. That is a view. It is not yet a weight. Weights come from the covariance, which is the next sitting.",
    ],
  },
  {
    id: "portfolio",
    index: "07",
    code: "15.415",
    title: "Black–Litterman allocation",
    sitting: "One sitting",
    labId: "bl",
    summary: "Start from the market, not from a forecast. Blend the view with a stated uncertainty.",
    extract:
      "Markowitz mean-variance optimization is sensitive to input errors. The Black-Litterman model solves this by establishing an anchor: market equilibrium returns (Pi) reverse-engineered from market capitalization weights under risk aversion delta: Pi = delta * Sigma * w_mkt. We then blend subjective investor views (Q) weighted by uncertainty (Omega) using Bayesian updating.",
    paragraphs: [
      "Mean–variance optimization treats expected returns as known. They are not. Small changes in μ produce wild changes in w, including large shorts in assets whose sample means were unlucky. Black–Litterman refuses to start there. It starts from weights you can see — market capitalization — and backs out the excess returns that would make those weights optimal for a risk aversion δ. Those implied returns are Π = δ Σ w_mkt. If you have no view, you hold the market. That is the point.",
      "A view is a statement P μ = Q, not a new vector of means you type over the old one. A relative view that foreign equity outperforms domestic by 4% is the row P = (−1, +1, 0) and Q = 0.04. An absolute view that bonds return 5.5% is the row (0, 0, 1) and Q = 0.055. Ω is the covariance of the error in those statements. The repository sets Ω to the diagonal of P (τ Σ) P', which scales view uncertainty with the prior uncertainty of the same combination of assets. τ Σ is the prior covariance of the mean itself. τ is small because means are tighter than single-period returns. A common classroom value is 0.05. It is not a law.",
      "The posterior mean is the precision-weighted blend in the extract’s code: the prior precision (τΣ)^{−1} and the view precision P' Ω^{−1} P. As Ω grows, the view is ignored and μ returns to Π. As Ω shrinks, the posterior is forced onto the view. Publish both, and publish the gap. A view that does not move the posterior was not information at the uncertainty you claimed.",
      "Reverse optimization w ∝ (δ Σ)^{−1} μ then imposes a budget by renormalizing weights to sum to one. Read the raw sum before you renormalize. If posterior returns are large relative to δ, the unconstrained solution wants leverage. Renormalizing hides that. The lab shows both. Constraints, short-sale bans, and transaction costs belong after this step, not inside the story you tell about the view.",
    ],
    equations: [
      { label: "Equilibrium excess return", text: "Π = δ Σ w_mkt" },
      { label: "Posterior mean", text: "μ = [ (τΣ)^(−1) + P' Ω^(−1) P ]^(−1) [ (τΣ)^(−1) Π + P' Ω^(−1) Q ]" },
      { label: "Repository Ω", text: "Ω = diag( diag( P (τΣ) P' ) )" },
    ],
    exampleTitle: "The repository three-asset book",
    example: [
      "Weights 55 / 35 / 10. δ = 2.5. τ = 0.05. Covariance as in the lab, untouched.",
      "Π ≈ 7.34%, 10.18%, 0.72%. Domestic, foreign, bonds.",
      "Views: foreign outperforms domestic by 4%, and bonds return 5.5%, with repository Ω. The posterior does not jump to the views. Bonds move up from 0.72% and stop well short of 5.5%, because the view is noisy relative to a low-volatility asset. Run the lab and read the spread, not a single weight.",
    ],
  },
  {
    id: "derivatives",
    index: "08",
    code: "15.437",
    title: "Derivatives and binomial pricing",
    sitting: "One sitting",
    labId: "binomial",
    summary: "The hedge portfolio does not need your forecast. The drift drops out.",
    extract:
      "Under the no-arbitrage principle, derivative pricing is independent of subjective risk preferences. Using a replicating portfolio, we arrive at risk-neutral valuation, discounting expected payoffs at the risk-free rate using risk-neutral probabilities: p = (exp(r*dt) - d) / (u - d).",
    paragraphs: [
      "In the Cox–Ross–Rubinstein tree the underlying moves to S u or S d over a step, with u = e^{σ √dt} and d = 1/u. A derivative that will be worth C_u or C_d can be replicated by holding Δ shares and an amount of bills. Match both nodes and the amount of cash you must post today is the price. Solve and the physical probability never enters. The weight that falls out is the risk-neutral probability in the extract, p* = (e^{r dt} − d) / (u − d). If p* is outside (0, 1), the tree itself contains an arbitrage. Discount the expected payoff under p* at the risk-free rate, step back to the root.",
      "As the number of steps grows and u, d are the CRR choice, the European price converges to Black–Scholes. With no dividends, d_1 = [log(S/K) + (r + ½σ²)T] / (σ √T) and d_2 = d_1 − σ √T. The call is S N(d_1) − K e^{−rT} N(d_2). Delta is N(d_1). Gamma and vega are the curvature and the volatility exposure of that replicating book. Theta is what the book bleeds if the underlying does not move. These are hedge ratios, not opinions.",
      "Put–call parity for European options on a non-dividend stock is model-free: C − P = S − K e^{−rT}. It is a static hedge, long stock and long put against long call and long bills, or the reverse. A residual that survives the bid–ask is an arbitrage, regardless of your volatility.",
      "An American call on a non-dividend stock is worth the same as the European call. Early exercise throws away time value and interest on the strike. An American put can be exercised early, because the strike received today earns interest and the insurance value of the put can be smaller than that. The tree checks the intrinsic value at every node. The closed form does not. A smile — implied volatility changing with strike — is the market saying constant-σ geometric Brownian motion is the wrong dynamics. The tree and the formula are still the benchmark you must be able to compute before you add jumps.",
    ],
    equations: [
      { label: "CRR step", text: "u = exp(σ √dt) ,   d = 1/u ,   p* = (e^{r dt} − d) / (u − d)" },
      { label: "Black–Scholes call", text: "C = S N(d1) − K e^(−rT) N(d2)" },
      { label: "Put–call parity", text: "C − P = S − K e^(−rT)" },
    ],
    exampleTitle: "At-the-money one-year call",
    example: [
      "S = K = 100, r = 5%, σ = 20%, T = 1. No dividend.",
      "d_1 = 0.35, d_2 = 0.15. Black–Scholes call ≈ 10.45. Delta ≈ 0.637.",
      "A 200-step CRR tree should come within a few cents. If your tree is dollars away, p* is wrong or you discounted at μ.",
    ],
  },
  {
    id: "analytics",
    index: "09",
    code: "Core",
    title: "Analytics of finance",
    sitting: "One sitting",
    labId: "analytics",
    summary: "A cross-section is a noisy price of risk. An execution schedule is a control problem.",
    paragraphs: [
      "Ordinary least squares is the conditional mean under a squared-error loss. In a one-factor cross-section, r_i = a + λ β_i + ε_i, the slope λ is the estimated premium per unit of beta and the intercept is what every name earns regardless of beta. The normal equations are small. The standard errors are not, once returns are fat-tailed, betas are estimated, and you have searched across factors. A single high-beta outlier can tilt λ and still leave a flattering R². Print the slope next to the true premium in a simulation before you print it next to a career.",
      "Finance residuals are heteroskedastic and serially correlated. A plain OLS t-statistic on overlapping returns overstates precision. Newey–West and clustered errors are the minimum adult correction. Bayesian and shrinkage estimators exist because the cross-section of means is mostly noise: ridge and random-effects priors pull extreme means toward a common center. That is the same instinct as Black–Litterman, applied to a regression.",
      "Machine learning does not repeal the multiple-testing problem. If you try two hundred signals and keep the best in-sample Sharpe, that Sharpe is biased up. Bailey and López de Prado’s deflated Sharpe is one way to say the hurdle rises with the number of trials and with the skewness of the strategy. An untouched test set is the other. Costs, borrow, and capacity belong in the same sentence as the signal. A forecast that does not survive its own turnover is not a forecast.",
      "Execution is dynamic optimization, not a footnote. Almgren and Chriss liquidate a position X over a horizon T. Trade too fast and temporary impact η charges you a cost that scales with the square of the speed. Trade too slowly and the inventory that remains is marked through volatility. Risk aversion λ sets the tradeoff. The optimal remaining inventory is hyperbolic: x(t) = X sinh(κ(T−t)) / sinh(κ T), with κ = √(λ σ² / η). As λ → 0, κ → 0 and the schedule becomes TWAP. As λ rises, you front-load. Permanent impact γ raises the expected cost but, in the linear specification, does not bend the trajectory. Know which parameter you are turning.",
    ],
    equations: [
      { label: "Cross-sectional premium", text: "r_i = a + λ β_i + ε_i" },
      { label: "Almgren–Chriss urgency", text: "κ = √( λ σ² / η )" },
      { label: "Remaining inventory", text: "x(t) = X · sinh( κ (T − t) ) / sinh( κ T )" },
      { label: "Temporary cost of a slice", text: "cost ≈ η · n² / τ" },
    ],
    exampleTitle: "A five-day liquidation",
    example: [
      "Sell 1,000,000 shares. Absolute daily volatility about 0.95 dollars. Horizon 5 days, 10 slices.",
      "Temporary impact η = 5×10^−7, so a TWAP schedule costs on the order of 100,000 dollars of temporary impact before permanent impact.",
      "At λ = 0 the optimal trade equals TWAP, 100,000 shares a slice. Raise λ and the first slice swells. The lab plots both trajectories and the risk-adjusted cost E[cost] + λ Var.",
    ],
  },
];

export const QUESTIONS: Question[] = [
  {
    id: "f1",
    moduleId: "foundations",
    prompt: "A project costs 100 today, returns 55 in one year and 60 in two years. The opportunity cost of capital is 8%. NPV is closest to:",
    choices: ["2.37", "15.00", "−2.37", "8.00"],
    answer: 0,
    explanation: "55/1.08 + 60/1.08² = 50.93 + 51.44 = 102.37. Subtract the outlay. NPV ≈ 2.37. Take the project.",
  },
  {
    id: "f2",
    moduleId: "foundations",
    prompt: "Two claims pay identical amounts in every state. One trades richer than the other. The arbitrage is:",
    choices: [
      "Buy the rich claim. It must be safer.",
      "Buy the cheap claim, sell the rich claim, and pocket the difference with no future liability.",
      "Short both and invest the proceeds at the risk-free rate.",
      "Do nothing. Prices can differ when investors disagree.",
    ],
    answer: 1,
    explanation: "Law of one price. Identical state payoffs must share a price, or the long-cheap short-rich book is an arbitrage.",
  },
  {
    id: "f3",
    moduleId: "foundations",
    prompt: "The risk-neutral probability Q is best described as:",
    choices: [
      "The investor’s subjective belief about the physical world.",
      "A reweighting of probabilities that absorbs risk premia, so payoffs can be discounted at the risk-free rate.",
      "The historical frequency of returns.",
      "Always equal to the physical measure P.",
    ],
    answer: 1,
    explanation: "Q is not a forecast. It is the measure under which the discounted price is a martingale. Risk preferences have been moved out of the expectation and into the probabilities.",
  },
  {
    id: "s1",
    moduleId: "stochastic",
    prompt: "For dS = μ S dt + σ S dW, the drift of log S is μ − ½σ² rather than μ because:",
    choices: [
      "Interest rates are stochastic.",
      "Itô’s lemma keeps the second-derivative term, and ∂² log S / ∂S² = −1/S².",
      "The Wiener process has a negative mean.",
      "Jensen’s inequality does not apply to the exponential.",
    ],
    answer: 1,
    explanation: "½ f_ss (σ S)² with f_ss = −1/S² equals −½σ². That term is the entire correction. The exponential of a normal is then skewed, so the mean of S exceeds the median.",
  },
  {
    id: "s2",
    moduleId: "stochastic",
    prompt: "S_0 = 100, μ = 8%, σ = 20%, T = 1. Which statement is true?",
    choices: [
      "The mean and the median of S_T are both 108.33.",
      "The mean is about 108.33 and the median is about 106.18, because the lognormal is right-skewed.",
      "The median exceeds the mean.",
      "The mean is S_0 (1 + μ − ½σ²).",
    ],
    answer: 1,
    explanation: "E[S_T] = 100 e^{0.08} ≈ 108.33. The median is 100 e^{0.06} ≈ 106.18. Skew puts the mean above the median.",
  },
  {
    id: "s3",
    moduleId: "stochastic",
    prompt: "Expected shortfall at 95%, as this desk computes it on the terminal price, is:",
    choices: [
      "The 5th percentile itself.",
      "The mean of terminal prices at or below the 5th percentile.",
      "1.65 times volatility.",
      "Always larger than the initial spot.",
    ],
    answer: 1,
    explanation: "VaR here is a quantile. Expected shortfall is the mean beyond that quantile. ES is a coherent risk measure. VaR is not subadditive in general.",
  },
  {
    id: "a1",
    moduleId: "accounting",
    prompt: "Inside FCFF, an increase in net working capital is:",
    choices: [
      "Added, because working capital is an asset.",
      "Ignored, because it reverses.",
      "Subtracted. It is cash absorbed by operations.",
      "Subtracted only after tax.",
    ],
    answer: 2,
    explanation: "ΔNWC is a use of cash when positive. FCFF = NOPAT + D&A − capex − ΔNWC.",
  },
  {
    id: "a2",
    moduleId: "accounting",
    prompt: "Discounting FCFF at the cost of equity is wrong because:",
    choices: [
      "Equity is always riskier than the firm, so the value would be too high.",
      "FCFF is paid to debt and equity together, so the matching rate is WACC (or use FCFE at the equity rate).",
      "FCFF is an accounting identity and cannot be discounted.",
      "The cost of equity already includes the tax shield.",
    ],
    answer: 1,
    explanation: "Match the claim to the rate. FCFF at r_E, or FCFE at WACC, mis-states value even when both inputs are individually estimated with care.",
  },
  {
    id: "a3",
    moduleId: "accounting",
    prompt: "After NOPAT = EBIT(1−t), depreciation is added back as:",
    choices: ["D&A multiplied by (1−t)", "The full D&A", "Capex multiplied by (1−t)", "Dividends"],
    answer: 1,
    explanation: "EBIT already deducted depreciation, and the tax shield is already inside (1−t). Adding the full non-cash charge avoids shielding it twice.",
  },
  {
    id: "c1",
    moduleId: "corporate",
    prompt: "E/V = 60%, D/V = 40%, r_E = 10%, r_D = 5%, tax = 21%. WACC is closest to:",
    choices: ["7.58%", "8.00%", "6.00%", "9.00%"],
    answer: 0,
    explanation: "0.60·0.10 + 0.40·0.05·0.79 = 0.060 + 0.0158 = 7.58%. The tax shield is why this is not an 8% blend.",
  },
  {
    id: "c2",
    moduleId: "corporate",
    prompt: "In Modigliani–Miller with no taxes, no distress, and fixed investment policy:",
    choices: [
      "More debt lowers WACC and raises firm value.",
      "Capital structure does not change firm value. Cheaper debt is offset by riskier equity.",
      "The firm should be all debt.",
      "Dividends are a residual only when rates are high.",
    ],
    answer: 1,
    explanation: "Proposition I. The tax shield is what breaks it. Do not import the with-tax intuition into the no-tax theorem.",
  },
  {
    id: "c3",
    moduleId: "corporate",
    prompt: "In the Dixit–Pindyck option to invest, a positive NPV can still be a reason to wait because:",
    choices: [
      "The discount rate is always too low.",
      "Investing kills a live option, and the trigger V* lies strictly above the investment cost when volatility and cash-flow yield make β finite.",
      "IRR exceeds NPV whenever volatility is positive.",
      "Taxes reverse the sign of NPV.",
    ],
    answer: 1,
    explanation: "V* = [β/(β−1)] I with β/(β−1) > 1. Exercising at V = I gives up the option value of delay.",
  },
  {
    id: "p1",
    moduleId: "computing",
    prompt: "The standard error of a Monte Carlo mean scales as:",
    choices: ["1/N", "1/√N", "1/N²", "σ², independent of N"],
    answer: 1,
    explanation: "SE = s/√N. Halving the error means multiplying the path count by four.",
  },
  {
    id: "p2",
    moduleId: "computing",
    prompt: "You need E[f(S_T)] and S follows GBM. The unbiased scheme at any step count is:",
    choices: [
      "Euler–Maruyama on a single step.",
      "The exact log-transition.",
      "A historical bootstrap of arithmetic returns, always.",
      "Simulating under μ and discounting at r.",
    ],
    answer: 1,
    explanation: "The GBM transition for S_T is known in closed form. Euler is biased for nonlinear f on a coarse grid. More paths do not remove that bias. Pricing still has to be done under Q, with drift r.",
  },
  {
    id: "p3",
    moduleId: "computing",
    prompt: "Antithetic variates (Z and −Z) do which of the following?",
    choices: [
      "Remove the bias of a wrong discretization.",
      "Keep the estimator unbiased for a symmetric shock and typically reduce its variance.",
      "Replace the need to report a standard error.",
      "Change the drift from μ to r.",
    ],
    answer: 1,
    explanation: "Antithetics are a variance reduction. They are not a finer time step and they are not a change of measure.",
  },
  {
    id: "m1",
    moduleId: "markets",
    prompt: "Risk-free rate 3%, market excess return 5%, beta 1.4. CAPM expected return is:",
    choices: ["10%", "8%", "7%", "12%"],
    answer: 0,
    explanation: "0.03 + 1.4 · 0.05 = 0.10. Beta scales the premium, then you add the cash rate back.",
  },
  {
    id: "m2",
    moduleId: "markets",
    prompt: "In r − r_f = α + β (r_m − r_f) + ε, the intercept α is:",
    choices: [
      "The Sharpe ratio.",
      "Average return relative to the CAPM benchmark, in sample.",
      "Idiosyncratic variance.",
      "The risk-free rate.",
    ],
    answer: 1,
    explanation: "Jensen’s alpha. A positive number beat that benchmark in the sample. It is not yet evidence of skill after costs and after you tried many specifications.",
  },
  {
    id: "m3",
    moduleId: "markets",
    prompt: "Relative to CAPM, the APT claim used on this desk is:",
    choices: [
      "Only the market portfolio can be priced.",
      "Well-diversified portfolios are priced by factor betas. Idiosyncratic risk is not, because it can be diversified away.",
      "Every stock’s residual must be zero.",
      "Expected return equals volatility.",
    ],
    answer: 1,
    explanation: "APT does not require mean-variance efficiency of the market portfolio. It also does not name the factors for you.",
  },
  {
    id: "b1",
    moduleId: "portfolio",
    prompt: "Π = δ Σ w_mkt is:",
    choices: [
      "The sample mean return.",
      "The excess-return vector that makes the market-cap portfolio optimal for risk aversion δ.",
      "The posterior after views.",
      "A vector of betas.",
    ],
    answer: 1,
    explanation: "Reverse optimization. If you have no view, you hold w_mkt. The implied means are the anchor, not a regression intercept.",
  },
  {
    id: "b2",
    moduleId: "portfolio",
    prompt: "Increasing every diagonal entry of Ω, the uncertainty of the views, moves the posterior mean:",
    choices: ["Toward Π", "Onto Q, ignoring P", "Toward equal weights", "Toward the minimum-variance portfolio"],
    answer: 0,
    explanation: "A noisier view gets less precision. The blend falls back on the equilibrium prior. Ω → 0 does the opposite and forces the view.",
  },
  {
    id: "b3",
    moduleId: "portfolio",
    prompt: "A relative view that foreign equity beats domestic equity by 4% is encoded as:",
    choices: [
      "Replace both expected returns with 4%.",
      "A row of P equal to (−1, +1, 0) and a scalar Q of 0.04, plus an uncertainty in Ω.",
      "A row of P equal to (1, 1, 0) and Q of 0.04.",
      "Doubling the foreign weight.",
    ],
    answer: 1,
    explanation: "Views are statements about combinations, Pμ = Q. The sign pattern is the trade. The uncertainty is a separate object. Do not paste 4% over the foreign mean and call it Black–Litterman.",
  },
  {
    id: "d1",
    moduleId: "derivatives",
    prompt: "In the CRR tree, the probability p* = (e^{r dt} − d) / (u − d):",
    choices: [
      "Is the investor’s real-world probability and therefore depends on μ.",
      "Is the risk-neutral weight from replication. μ does not appear.",
      "Equals 1/2 for every parameter set.",
      "Is used only for American options.",
    ],
    answer: 1,
    explanation: "The hedge matches both nodes, so preferences and the physical drift drop out. If your price depends on μ, you are not pricing a replicable claim.",
  },
  {
    id: "d2",
    moduleId: "derivatives",
    prompt: "S = 100, K = 100, r = 5%, T = 1, European call = 12, European put = 6. Put–call parity says:",
    choices: [
      "The pair is consistent. The residual is about zero.",
      "The call is rich relative to the put. The residual C − P − (S − Ke^{−rT}) is about +1.12.",
      "The put is rich by about 1.12.",
      "Parity does not apply at the money.",
    ],
    answer: 1,
    explanation: "Ke^{−0.05} ≈ 95.12. S − PV(K) ≈ 4.88. C − P = 6. Residual ≈ 1.12. The call is rich relative to the put on a static hedge. Moneyness is irrelevant to parity.",
  },
  {
    id: "d3",
    moduleId: "derivatives",
    prompt: "Early exercise, with no dividends:",
    choices: [
      "Is optimal for deep in-the-money American calls, and never for puts.",
      "Is never optimal for an American call. It can be optimal for an American put.",
      "Is optimal for both whenever implied vol exceeds 20%.",
      "Does not change the price of an American put relative to the European put.",
    ],
    answer: 1,
    explanation: "A non-dividend American call equals its European twin. An American put can be worth more because the strike, received early, earns interest.",
  },
  {
    id: "n1",
    moduleId: "analytics",
    prompt: "You fit r = a + λ β + ε on a cross-section and one high-beta name is a huge positive outlier. The disciplined reading is:",
    choices: [
      "R² is high, so λ is the premium.",
      "The slope can be tilted by that single point. Compare λ to the process that generated the data before you trust it.",
      "Drop beta and regress on volatility instead, always.",
      "The intercept is the Sharpe ratio.",
    ],
    answer: 1,
    explanation: "Squared-error regression chases outliers. A pretty R² is not a robust price of risk. The lab lets you move the outlier and watch λ.",
  },
  {
    id: "n2",
    moduleId: "analytics",
    prompt: "In Almgren–Chriss, raising the temporary-impact coefficient η, with λ and σ fixed:",
    choices: [
      "Raises κ and front-loads the schedule further.",
      "Lowers κ = √(λ σ² / η) and pulls the schedule toward TWAP.",
      "Does not enter κ.",
      "Removes permanent impact.",
    ],
    answer: 1,
    explanation: "Impact in the denominator of κ means fast trading got more expensive, so the optimum is more patient. λ → 0 is the TWAP limit even at the original η.",
  },
  {
    id: "n3",
    moduleId: "analytics",
    prompt: "You tried 200 signals and kept the best in-sample Sharpe. The honest next step is:",
    choices: [
      "Allocate the book. The t-statistic is conditional on nothing.",
      "Treat that Sharpe as upward-biased. Demand an untouched test, a deflated hurdle, and a costed turnover.",
      "Double the leverage to monetize the result.",
      "Ignore costs. They are second order when the Sharpe exceeds 1.",
    ],
    answer: 1,
    explanation: "Selection across many trials inflates the in-sample Sharpe. Skill is what survives a test you did not tune on, after borrow, impact, and capacity.",
  },
];

export const TRACKS: Track[] = [
  {
    id: "capital-markets",
    code: "CM",
    title: "Capital markets",
    focus: "Global markets, portfolio construction, and the instruments institutions actually trade.",
    paragraphs: [
      "This track is the book. Equilibrium returns, active views, futures basis, and the difference between a benchmark and a mandate. The core sittings on markets, Black–Litterman, and derivatives are the spine. What changes in the track is the constraint set: long-only, tracking error, liquidity, and a client who will see the drawdown.",
      "International markets add a currency overlay that is a separate decision from the asset decision. An unhedged foreign equity is a foreign-equity view plus a short-dollar view. If you only meant one of those, hedge the other. Crypto, in this track, is a collateral and basis market first and a narrative second: funding, perpetual basis, and custody risk belong in the expected-return build-up before anyone mentions a regime.",
    ],
    electives: [
      { title: "Fixed income and curve instruments", body: "Price from discount factors, not from a yield to maturity you then average. Duration is the derivative. Key-rate exposures tell you which pivot you actually hold. Credit is a short put on the firm plus a funding spread." },
      { title: "Futures, basis, and overlays", body: "The fair futures price is the spot plus carry minus convenience yield, scaled to the delivery date. A view on the basis is not a view on the underlying. Most overlay errors are that confusion." },
      { title: "Quantitative implementation", body: "Translate μ_BL into weights only after impact, borrow, and a tracking-error budget. An unconstrained reverse-optimized book is a research note, not a position." },
    ],
    caseTitle: "Case · A CIO memo and a corner solution",
    case: [
      "A long-only global equity desk is handed a memo: emerging-market equities will outperform developed markets by 4% over the next year. The author is confident. A mean–variance optimizer fed that return directly puts a third of the book in a market that is a tenth of the benchmark, and shorts the home market the mandate cannot short.",
      "You have one meeting to stop the trade or to resize it. You do not get new data.",
    ],
    reveal: [
      "Do not paste 4% into the EM expected return and press optimize. Encode a relative view, P with −1 on developed and +1 on emerging, Q = 0.04. Set Ω from the confidence you can defend, not from the adjective in the memo. A tight Ω will still move the active weight. A wide Ω will not, and that is the correct answer if the memo is a hunch.",
      "Then impose the mandate: long-only, active weights inside a tracking-error budget, position caps at a stated fraction of average daily volume. The Black–Litterman posterior is the input. The optimizer with constraints is the portfolio. Show the CIO both the unconstrained corner and the constrained book so the 4% stops looking free.",
    ],
  },
  {
    id: "corporate-finance",
    code: "CF",
    title: "Corporate finance",
    focus: "Capital structure, valuation, and the decisions that change enterprise value.",
    paragraphs: [
      "The corporate track is a sequence of claims on the same free cash flow. Who has the senior claim, what the tax authority takes, and which investment options have not been exercised. The accounting sitting builds FCFF. The corporate sitting prices the shield and the option to wait. Transactions — buyouts, carve-outs, recapitalizations — are those tools with a control premium and a debt document.",
      "Healthcare and other regulated franchises add a political state variable: reimbursement, approval, and antitrust. Do not bury it in the margin. Give it a scenario, an explicit cash-flow path, and a probability you are willing to write down.",
    ],
    electives: [
      { title: "Mergers, buyouts, and private equity", body: "Entry multiple, exit multiple, and the path of debt are the return. Synergies you cannot name in the P&L are not synergies. Fees and management equity are claims, not footnotes." },
      { title: "Venture and entrepreneurial finance", body: "A priced round is a claim on a claim. Pre-money value, option pool, and liquidation preference move who owns the upside in the scenarios that matter, which are not the base case." },
      { title: "Statement analysis under stress", body: "Re-forecast cash, not earnings. Covenants bind on definitions in the credit agreement. A firm can show a profit and still trip a leverage test." },
    ],
    caseTitle: "Case · Hold-period return on a buyout",
    case: [
      "A sponsor buys a services platform at 11× EBITDA. EBITDA is 100. Equity cheque is 40% of enterprise value. Debt is the rest, cash-pay, and you assume it is unchanged at exit for this first pass. Hold for five years. EBITDA grows at 6% a year. Exit at 10×. Ignore fees and excess cash.",
      "Is this a 20% equity story, or did the multiple compression eat it?",
    ],
    reveal: [
      "Entry EV = 1,100. Equity in = 440. Debt = 660, held constant.",
      "EBITDA at exit = 100 · 1.06⁵ ≈ 133.8. Exit EV = 1,338. Equity out = 1,338 − 660 = 678.",
      "Equity multiple = 678 / 440 ≈ 1.54×. Over five years that is about 9% per year, not 20. The growth helped. The turn of multiple, 11 to 10, and the lack of debt paydown took the rest. A real memo adds amortization, fees, and the option to delay the exit. It does not start from a target IRR and back into a multiple.",
    ],
  },
  {
    id: "financial-engineering",
    code: "FE",
    title: "Financial engineering",
    focus: "Stochastic calculus, derivative books, and risk systems that have to run.",
    paragraphs: [
      "This is the quantitative track. The stochastic sitting, the tree, and the execution lab are required equipment. What you add is the part the closed form hides: hedges that cannot be rebalanced continuously, volatility that depends on strike, and risk measures that have to add up across desks.",
      "A pricing model earns its place when the hedge it implies is a hedge you can put on. Black–Scholes delta is the benchmark. A smile model changes the delta. If you cannot say how, you do not have a model. You have a parameter.",
    ],
    electives: [
      { title: "Volatility and the smile", body: "Implied volatility rising in the wings means the risk-neutral distribution has heavier tails than a lognormal. Sticky-strike and sticky-delta are hedge conventions, not theorems. Recalibrate and recompute delta. Do not scale vega by a rule of thumb and call it a book." },
      { title: "Credit and wrong-way risk", body: "A counterparty whose default arrives in the same state as your positive exposure is not the Black–Scholes counterparty. CVA is a derivative on a derivative. The correlation you assume is the whole price." },
      { title: "Numerical methods", body: "Trees for early exercise, Monte Carlo for path dependence, Fourier or PDE methods when the characteristic function is known. Match the tool to the clause in the contract, not to the library you already imported." },
    ],
    caseTitle: "Case · The hedge that assumed the wrong drift",
    case: [
      "A junior books a one-year at-the-money call, S = K = 100, r = 5%, σ = 20%, and reports a price of about 13. The desk’s Black–Scholes screen says 10.45. The junior’s Monte Carlo used 50,000 paths and a tiny standard error, so they trust it.",
      "Find the bug without rerunning their code.",
    ],
    reveal: [
      "A tight standard error rules out noise. It does not rule out the wrong measure. The usual bug is simulating the physical drift μ — often 8 to 12 percent — and discounting the payoff at r. That inflates the call by roughly the extra drift through the delta.",
      "The fix is the risk-neutral drift. Under Q the asset grows at r, not at μ. Fifty thousand paths of the exact map with drift 5% should print about 10.45, inside a few cents of standard error. If it does not, the discount factor or the payoff is wrong. μ belongs in the VaR book, not in the option price.",
    ],
  },
  {
    id: "climate",
    code: "CSIF",
    title: "Climate and social impact",
    focus: "State variables that policy and physics move, and the cash flows that follow.",
    paragraphs: [
      "Climate finance is not a separate discount rate you invent to sound serious. It is ordinary valuation with an extra state variable: a carbon price, a physical-loss distribution, a subsidy that can be repealed. If you cannot show the cash-flow line that moves, you do not have an impact thesis. You have an adjective.",
      "Impact measurement has the same multiple-testing problem as a trading signal. Additionality is the alpha. A project that would have been built anyway is a market-rate asset wearing a label. Price that honestly, then decide whether the concessionary slice of the return is a donation you intend to make.",
    ],
    electives: [
      { title: "Carbon as a cash-flow line", body: "Emissions times a price path, after any free allocation, is a cost or a revenue. Put it below EBITDA and above free cash flow. Scenario the price. Do not bury it in a lower WACC." },
      { title: "Energy markets", body: "Power prices, fuel, and capacity payments do not move together by assumption. A spark-spread model with a stated heat rate beats a single growth rate on revenue." },
      { title: "Greenium and labeled debt", body: "A green bond’s yield discount, when it exists, is small and unstable. Do not underwrite a project on the greenium. Underwrite it on the cash flows, and treat cheaper labeled debt as an option that may or may not clear." },
    ],
    caseTitle: "Case · Where the plant’s NPV changes sign",
    widget: "carbon",
    case: [
      "A generation asset costs 200 up front and, before carbon, throws off 40 a year for ten years. Discount at 8%. It emits 200,000 tonnes a year. In millions, that is 0.2 of cash flow per dollar of carbon price.",
      "At what carbon price does the NPV cross zero, and is that a reason to change the discount rate?",
    ],
    reveal: [
      "The ten-year annuity factor at 8% is about 6.71. At a zero carbon price, PV of cash flows ≈ 268 and NPV ≈ 68.",
      "Each dollar of carbon price cuts annual cash flow by 0.2, and NPV by about 1.34. The zero is near 50 dollars a tonne: cash flow falls to 30, PV ≈ 201, NPV ≈ 1. The slider on this page is that arithmetic.",
      "Do not “handle climate” by adding 2 points to WACC. That hides which state you are worried about. Price the carbon, then discount the cash flows you have left at a cost of capital that matches their remaining risk.",
    ],
  },
  {
    id: "fintech",
    code: "FT",
    title: "FinTech",
    focus: "Consumer finance, payments, and venture structures where the unit economics are the product.",
    paragraphs: [
      "FinTech is a funding and distribution problem that happens to have a software interface. The questions that matter are old: who bears the credit loss, what the cost of funds is on the receivable, and what you pay to acquire the next dollar of volume. The technology changes the cost curve. It does not repeal it.",
      "Crypto businesses on this track are balance sheets plus a protocol fee. Treasury, custody, and the duration of the token incentive are corporate-finance problems. Treat the token as a security with a stated claim, or do not model it as equity.",
    ],
    electives: [
      { title: "Consumer credit", body: "A take-rate is not a margin. Subtract funding on the days you actually finance, expected loss, fraud, and servicing. What remains has to pay back acquisition cost in a horizon you can finance." },
      { title: "Payments", body: "Interchange, scheme fees, and a take-rate stack. Volume is vanity if the contribution per transaction is smaller than the support cost. Float is a funding source with a regulator attached." },
      { title: "Venture structure", body: "A preferred stack with a participating liquidation preference can take the whole outcome in the mediocre exit and still leave the common with the cap-table percentage in the great one. Model both exits before you celebrate the post-money." },
    ],
    caseTitle: "Case · BNPL contribution",
    widget: "bnpl",
    case: [
      "A pay-in-four product takes a merchant fee, funds the receivable for a little over a month, and eats a credit loss. Marketing wants to spend 20 to acquire a customer who might place several orders.",
      "Before the brand campaign: what does one hundred of merchandise volume actually contribute, and how many orders repay the acquisition cost?",
    ],
    reveal: [
      "Write the identity in public. Contribution on 100 of volume = take-rate revenue − funding (APR × days/365 × volume) − credit loss − variable ops.",
      "A 6% take, 9% funding cost, 45 days, 2.2% loss, and 0.35 of ops leaves a little over 2 per 100 of volume. A 20 acquisition cost then needs on the order of ten such orders at a 100 ticket, before fixed costs and before you count the customers who never return.",
      "If the slider on this page cannot pay back inside the repeat rate you believe, the product is a customer-acquisition expense, not a spread business. Say which one you are underwriting.",
    ],
  },
];

export const BRIEFS: Brief[] = [
  {
    id: "zoo",
    sponsor: "Hedge fund lab",
    title: "Does the factor zoo survive costs?",
    ask: "A pod asks whether value and momentum are still paid after you trade them at their real capacity. Design the test. Do not deliver a backtest screenshot.",
    reveal: [
      "Pre-register the factors, the universe, and the cost model. Gross Sharpe on overlapping papers is not the object. The object is net-of-cost return on an untouched window, with impact that increases in participation and a multiple-testing hurdle that knows how many variants you tried.",
      "Identification: the null is that net alpha is zero after a stated cost. Report the deflated hurdle beside the in-sample number. If the strategy only works in names you cannot borrow or cannot trade inside 10% of daily volume, the capacity is the result.",
    ],
  },
  {
    id: "hedge",
    sponsor: "Corporate lab",
    title: "Hedge the floating-rate tranche, or don’t",
    ask: "A sponsor asks whether to swap the floating tranche of a buyout to fixed. They have a view that rates will fall. Separate the hedge from the view.",
    reveal: [
      "The hedge is not a rate forecast. It is a decision about which state hurts the equity. If the credit is tight when rates rise — margin pressure, refinance risk — paying fixed is insurance, and the fair premium is the swap rate, not your view.",
      "If the sponsor wants to express “rates will fall,” that is a speculative receiver swap, sized as risk capital, outside the debt covenant. Mixing the two in one notional is how a hedge becomes a second bet. Write the objective: variance of equity cash flow, or a view. You cannot optimize both without saying the weight.",
    ],
  },
  {
    id: "memo",
    sponsor: "Markets lab",
    title: "Turn a CIO memo into Ω",
    ask: "The memo says the desk “strongly believes” quality will beat the market by 3% this year. Produce the view matrices and two Ω’s: one you would sign, and one that matches the adjective.",
    reveal: [
      "P is a relative row, long quality and short the market, Q = 0.03. The adjective is not a number. Map “strong” to a small multiple of the prior variance of that spread, and map a number you would sign to something wider if the memo has no identification.",
      "Show active risk under both Ω’s, inside the tracking-error limit. If only the flattering Ω fits inside the limit, say so. The deliverable is the sensitivity, not a single recommended weight.",
    ],
  },
];

export function getModule(id: string): Module | undefined {
  return MODULES.find((m) => m.id === id);
}

export function getLab(id: string): LabInfo | undefined {
  return LABS.find((l) => l.id === id);
}

export function getTrack(id: string): Track | undefined {
  return TRACKS.find((t) => t.id === id);
}

export function questionsFor(moduleId: string): Question[] {
  const core = QUESTIONS.filter((q) => q.moduleId === moduleId);
  if (core.length > 0) return core;
  return PREP_QUESTIONS.filter((q) => q.moduleId === moduleId);
}

export function drawBoard(seed: number): Question[] {
  let a = seed >>> 0;
  const rand = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const picked: Question[] = [];
  for (const module of MODULES) {
    const pool = questionsFor(module.id);
    picked.push(pool[Math.floor(rand() * pool.length)]);
  }
  const rest = QUESTIONS.filter((q) => !picked.includes(q));
  picked.push(rest[Math.floor(rand() * rest.length)]);
  for (let i = picked.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = picked[i];
    picked[i] = picked[j];
    picked[j] = tmp;
  }
  return picked;
}

export const GBM_CODE = `import numpy as np

def run_gbm_simulation(S0=100.0, mu=0.08, sigma=0.20, T=1.0, N=252, paths=50000):
    dt = T / N
    Z = np.random.standard_normal((N, paths))
    returns = (mu - 0.5 * sigma**2) * dt + sigma * np.sqrt(dt) * Z
    price_paths = np.vstack([np.ones(paths) * S0, S0 * np.exp(np.cumsum(returns, axis=0))])
    terminal_prices = price_paths[-1]
    var_95 = np.percentile(terminal_prices, 5)
    expected_shortfall = terminal_prices[terminal_prices <= var_95].mean()
    print(f"Mean Terminal Price: \${terminal_prices.mean():.2f}")
    print(f"95% Value at Risk (VaR): \${S0 - var_95:.2f}")

run_gbm_simulation()`;

export const BL_CODE = `import numpy as np

market_caps = np.array([0.55, 0.35, 0.10])
w_mkt = market_caps / np.sum(market_caps)
Sigma = np.array([[0.035, 0.028, 0.003],
                  [0.028, 0.072, 0.001],
                  [0.003, 0.001, 0.009]])
delta = 2.5; tau = 0.05
Pi = delta * np.dot(Sigma, w_mkt)
P = np.array([[-1.0, 1.0, 0.0], [0.0, 0.0, 1.0]])
Q = np.array([0.04, 0.055])
Omega = np.diag(np.diag(np.dot(P, np.dot(tau * Sigma, P.T))))
inv_tau_sigma = np.linalg.inv(tau * Sigma)
inv_omega = np.linalg.inv(Omega)
middle_inv = np.linalg.inv(inv_tau_sigma + np.dot(P.T, np.dot(inv_omega, P)))
rhs = np.dot(inv_tau_sigma, Pi) + np.dot(P.T, np.dot(inv_omega, Q))
mu_bl = np.dot(middle_inv, rhs)`;

export const BINOM_CODE = `import numpy as np

def binomial_option_pricing(S, K, T, r, sigma, steps=100, option_type="call"):
    dt = T / steps
    u = np.exp(sigma * np.sqrt(dt))
    d = 1.0 / u
    p = (np.exp(r * dt) - d) / (u - d)
    prices = S * (u ** np.arange(steps, -1, -1)) * (d ** np.arange(0, steps + 1))
    values = np.maximum(prices - K, 0) if option_type == "call" else np.maximum(K - prices, 0)
    for i in range(steps - 1, -1, -1):
        prices = S * (u ** np.arange(i, -1, -1)) * (d ** np.arange(0, i + 1))
        values = np.exp(-r * dt) * (p * values[:-1] + (1 - p) * values[1:])
    return values[0]`;
