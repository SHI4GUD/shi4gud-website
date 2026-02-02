import React, { useState } from 'react';
import {
  CheckCircle2,
  Coins,
  FileText,
  Layers,
  Link2,
  Mail,
  Send,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useSanityQuery } from '../hooks/useSanityQuery';
import { ListingPageData } from '../types/types';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ICON_MAP = {
  coins: Coins,
  layers: Layers,
  link: Link2,
  zap: Zap,
} as const;

const LISTING_CRITERIA_DEFAULTS = [
  { icon: 'coins', title: 'ERC-20 Token', description: 'Your token must be a standard ERC-20 token deployed on an EVM-compatible blockchain (Ethereum, Base, Shibarium, etc.).' },
  { icon: 'layers', title: 'Uniswap Liquidity Pool', description: 'A Uniswap V2 or V3 liquidity pool must exist for your token. The Burn Bank uses this pool as an on-chain price oracle for real-time pricing.' },
  { icon: 'link', title: 'Verified Contract', description: 'Your token contract should be verified on a block explorer. This ensures transparency and allows the team to audit the token mechanics.' },
  { icon: 'zap', title: 'Active Community', description: "We prioritize tokens with an engaged community and legitimate use case. Share your project's website, social links, and community channels." },
];

const SUPPORTED_CHAINS_DEFAULT = 'Ethereum, Sepolia (Testnet), Base (Coming Soon), Shibarium (Coming Soon)';

const FORM_FIELDS_DEFAULT = [
  { name: 'Project Name', label: 'Project / Token Name *', placeholder: 'e.g. Shina Inu', inputType: 'text' as const, required: true, fullWidth: false },
  { name: 'Token Symbol', label: 'Token Symbol *', placeholder: 'e.g. SHI', inputType: 'text' as const, required: true, fullWidth: false },
  { name: 'Contract Address', label: 'Token Contract Address *', placeholder: '0x...', inputType: 'text' as const, required: true, fullWidth: true },
  { name: 'Chain', label: 'Target Chain *', inputType: 'select' as const, required: true, selectPlaceholder: 'Select chain...', selectOptions: [{ value: 'Ethereum', label: 'Ethereum' }, { value: 'Sepolia', label: 'Sepolia (Testnet)' }, { value: 'Base', label: 'Base (Coming Soon)' }, { value: 'Shibarium', label: 'Shibarium (Coming Soon)' }], fullWidth: true },
  { name: 'Email', label: 'Your Email *', placeholder: 'you@example.com', inputType: 'email' as const, required: true, fullWidth: true },
  { name: 'Website', label: 'Website', placeholder: 'https://...', inputType: 'url' as const, required: false, fullWidth: false },
  { name: 'Social Links', label: 'Twitter / Telegram / Discord', placeholder: 'Links to your community', inputType: 'text' as const, required: false, fullWidth: false },
  { name: 'Message', label: 'Additional Information', placeholder: 'Tell us about your project, Uniswap pool address, community size, or any other relevant details...', inputType: 'textarea' as const, required: false, textareaRows: 4, fullWidth: true },
];

const listingPageQuery = `*[_type == "listingPage"][0]{
  hero{
    title,
    subtitle
  },
  whatWeOffer{
    title,
    description,
    items[]{
      text
    }
  },
  listingCriteria{
    title,
    introText,
    criteriaItems[]{
      icon,
      title,
      description
    },
    supportedChainsLabel,
    supportedChains,
    pdfSection{
      title,
      description,
      buttonText,
      "pdfUrl": pdfFile.asset->url
    }
  },
  formSection{
    title,
    introText,
    successMessage,
    errorMessagePrefix,
    contactEmail,
    submitButtonText,
    submittingButtonText,
    formFields[]{
      name,
      label,
      placeholder,
      inputType,
      required,
      selectPlaceholder,
      selectOptions[]{
        value,
        label
      },
      textareaRows,
      fullWidth
    }
  },
  footer{
    questionsText,
    contactEmail
  }
}`;

const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
const LISTING_CRITERIA_PDF_URL = import.meta.env.VITE_LISTING_CRITERIA_PDF_URL;
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL;

const ListingPage: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const { data, isLoading, error } = useSanityQuery<ListingPageData>(['listingPage'], listingPageQuery);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append('access_key', WEB3FORMS_ACCESS_KEY);
    formData.append('subject', 'New Token Listing Application - SHI4GUD');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="py-[60px] md:py-[100px] text-center text-white">Error loading page content.</div>;
  }

  // Use Sanity data with fallbacks to defaults
  const hero = data?.hero;
  const whatWeOffer = data?.whatWeOffer;
  const listingCriteria = data?.listingCriteria;
  const formSection = data?.formSection;
  const footer = data?.footer;

  const heroTitle = hero?.title ?? 'List Your Token';
  const heroSubtitle =
    hero?.subtitle ??
    'Want a Burn Bank deployed for your token? Review the listing criteria below and submit your application. Our team will review and get back to you.';

  const whatWeOfferTitle = whatWeOffer?.title ?? 'What We Offer';
  const whatWeOfferDescription =
    whatWeOffer?.description ??
    'We can deploy a Burn Bank for your token on the SHI4GUD platform. A Burn Bank enables:';
  const WHAT_WE_OFFER_DEFAULT_ITEMS = [
    'Staking — Users stake your token to participate',
    'Donations — ETH donations trigger automatic token burns',
    'Charity — A portion of donations goes to the Gud Fund (Endaoment)',
    'Rewards — Stakers can win a share of donations in lottery-style drawings',
  ];
  const whatWeOfferItems =
    (whatWeOffer?.items?.length ?? 0) > 0
      ? whatWeOffer!.items!.map((i) => i.text ?? '').filter(Boolean)
      : WHAT_WE_OFFER_DEFAULT_ITEMS;

  const criteriaTitle = listingCriteria?.title ?? 'Listing Criteria';
  const criteriaIntro =
    listingCriteria?.introText ??
    'To be considered for a Burn Bank deployment, your token should meet the following requirements:';
  const criteriaItems =
    (listingCriteria?.criteriaItems?.length ?? 0) > 0
      ? listingCriteria!.criteriaItems!
      : LISTING_CRITERIA_DEFAULTS;
  const supportedChainsLabel = listingCriteria?.supportedChainsLabel ?? 'Supported chains:';
  const supportedChains = listingCriteria?.supportedChains ?? SUPPORTED_CHAINS_DEFAULT;
  const supportedChainsArray = supportedChains.split(',').map((s) => s.trim()).filter(Boolean);

  const pdfSectionData = listingCriteria?.pdfSection;
  const pdfTitle = pdfSectionData?.title ?? 'Full Listing Requirements';
  const pdfDescription =
    pdfSectionData?.description ??
    'Download the complete listing criteria, technical requirements, and process details.';
  const pdfButtonText = pdfSectionData?.buttonText ?? 'Download PDF';
  const pdfUrl = pdfSectionData?.pdfUrl ?? LISTING_CRITERIA_PDF_URL ?? '#';

  const formTitle = formSection?.title ?? 'Submit Your Application';
  const formIntro =
    formSection?.introText ?? 'Fill out the form below. We typically respond within a few business days.';
  const successMessage =
    formSection?.successMessage ?? "Thank you! Your application has been submitted. We'll be in touch soon.";
  const errorMessagePrefix =
    formSection?.errorMessagePrefix ?? 'Something went wrong. Please try again or email us directly at';
  const formContactEmail = formSection?.contactEmail ?? CONTACT_EMAIL ?? 'shi4gud@gmail.com';
  const submitButtonText = formSection?.submitButtonText ?? 'Submit Application';
  const submittingButtonText = formSection?.submittingButtonText ?? 'Sending...';
  const formFields = (formSection?.formFields?.length ?? 0) > 0 ? formSection!.formFields! : FORM_FIELDS_DEFAULT;

  const footerQuestionsText = footer?.questionsText ?? 'Questions? Reach out at';
  const footerContactEmail = footer?.contactEmail ?? CONTACT_EMAIL ?? 'shi4gud@gmail.com';

  return (
    <div className="py-[60px] md:py-[100px]">
      <div className="max-w-[1000px] mx-auto px-5">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="font-extrabold mb-5 bg-gradient-to-r from-[#ff6b6b] via-[#ffd93d] to-[#6bcf7f] bg-clip-text text-transparent text-[3rem] md:text-6xl leading-tight">
            {heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">{heroSubtitle}</p>
        </div>

        {/* What We Offer */}
        <div className="bg-gradient-to-r from-[rgba(255,107,107,0.1)] to-[rgba(255,142,83,0.1)] border border-[rgba(255,107,107,0.3)] rounded-[20px] p-6 md:p-8 mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-[#ff6b6b]" />
            <h2 className="text-2xl md:text-3xl font-bold text-white">{whatWeOfferTitle}</h2>
          </div>
          <p className="text-white/90 leading-relaxed mb-4">{whatWeOfferDescription}</p>
          <ul className="space-y-2 text-white/90">
            {(Array.isArray(whatWeOfferItems) ? whatWeOfferItems : []).map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#6bcf7f] flex-shrink-0" />
                <span>{typeof item === 'string' ? item : (item as { text?: string })?.text ?? ''}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Listing Criteria */}
        <div className="bg-white/5 rounded-[20px] p-5 md:p-10 border border-white/10 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 bg-gradient-to-r from-[#FFD700] via-[#98FB98] to-[#90EE90] bg-clip-text text-transparent">
            {criteriaTitle}
          </h2>
          <p className="text-white/80 mb-8">{criteriaIntro}</p>
          <div className="grid gap-6 md:grid-cols-2">
            {criteriaItems.map((item, index) => {
              const IconComponent = item.icon ? ICON_MAP[item.icon as keyof typeof ICON_MAP] : Coins;
              const Icon = IconComponent ?? Coins;
              return (
                <div
                  key={index}
                  className="bg-white/5 rounded-[16px] p-5 border border-white/10 hover:border-[rgba(255,107,107,0.3)] transition-colors"
                >
                  <div className="text-[#ff6b6b] mb-3">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{item.title ?? ''}</h3>
                  <p className="text-white/80 text-sm leading-relaxed">{item.description ?? ''}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-white/70 text-sm">
              <strong className="text-white">{supportedChainsLabel}</strong> {supportedChainsArray.join(', ')}
            </p>
          </div>

          {/* PDF Download */}
          <div className="mt-8 p-5 bg-gradient-to-r from-[rgba(255,107,107,0.1)] to-[rgba(255,142,83,0.1)] border border-[rgba(255,107,107,0.3)] rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <FileText className="w-10 h-10 text-[#ff6b6b] flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-white">{pdfTitle}</h3>
                  <p className="text-white/70 text-sm">{pdfDescription}</p>
                </div>
              </div>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#ff6b6b] to-[#ff8e53] py-2.5 px-5 rounded-xl text-white font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(255,107,107,0.3)] flex-shrink-0"
              >
                <FileText className="w-5 h-5" />
                {pdfButtonText}
              </a>
            </div>
          </div>
        </div>

        {/* Submission Form */}
        <div className="bg-white/5 rounded-[20px] p-5 md:p-10 border border-white/10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-[#ff6b6b] to-[#ffd93d] bg-clip-text text-transparent">
            {formTitle}
          </h2>
          <p className="text-white/80 mb-8">{formIntro}</p>

          {status === 'success' && (
            <div className="mb-6 p-4 bg-[#6bcf7f]/20 border border-[#6bcf7f]/50 rounded-xl text-[#6bcf7f] flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
              <p>{successMessage}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="mb-6 p-4 bg-[#ff6b6b]/20 border border-[#ff6b6b]/50 rounded-xl text-[#ff6b6b]">
              {errorMessagePrefix}{' '}
              <a href={`mailto:${formContactEmail}`} className="underline">
                {formContactEmail}
              </a>
              .
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {formFields.map((field, idx) => {
                const fieldId = `field-${idx}-${field.name ?? ''}`.replace(/\s/g, '-');
                const isHalfWidth = field.fullWidth === false;

                const inputEl = (() => {
                  if (field.inputType === 'select') {
                    return (
                      <select
                        id={fieldId}
                        name={field.name ?? ''}
                        required={field.required ?? false}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#ff6b6b] focus:border-transparent"
                      >
                        <option value="" className="bg-[#1a1a2e] text-white">
                          {field.selectPlaceholder ?? 'Select...'}
                        </option>
                        {(field.selectOptions ?? []).map((opt, i) => (
                          <option key={i} value={opt.value ?? ''} className="bg-[#1a1a2e] text-white">
                            {opt.label ?? opt.value ?? ''}
                          </option>
                        ))}
                      </select>
                    );
                  }
                  if (field.inputType === 'textarea') {
                    return (
                      <textarea
                        id={fieldId}
                        name={field.name ?? ''}
                        rows={field.textareaRows ?? 4}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#ff6b6b] focus:border-transparent resize-none"
                        placeholder={field.placeholder ?? ''}
                      />
                    );
                  }
                  return (
                    <input
                      id={fieldId}
                      name={field.name ?? ''}
                      type={field.inputType ?? 'text'}
                      required={field.required ?? false}
                      className={`w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#ff6b6b] focus:border-transparent ${field.name?.toLowerCase().includes('contract') ? 'font-mono text-sm' : ''}`}
                      placeholder={field.placeholder ?? ''}
                    />
                  );
                })();

                return (
                  <div key={idx} className={isHalfWidth ? '' : 'md:col-span-2'}>
                    <label htmlFor={fieldId} className="block text-sm font-medium text-white/90 mb-2">
                      {field.label ?? ''}
                    </label>
                    {inputEl}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#ff6b6b] to-[#ff8e53] py-3 px-8 rounded-[25px] text-white font-semibold transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(255,107,107,0.3)] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {status === 'submitting' ? (
                  <>
                    <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {submittingButtonText}
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {submitButtonText}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-white/50 text-sm mt-8 flex flex-wrap items-center justify-center gap-x-1.5">
          <span>{footerQuestionsText}</span>
          <a
            href={`mailto:${footerContactEmail}`}
            className="text-[#ff6b6b] hover:underline inline-flex items-center gap-1"
          >
            <Mail className="w-4 h-4 flex-shrink-0 -mt-0.5" />
            <span>{footerContactEmail}</span>
          </a>
        </p>
      </div>
    </div>
  );
};

export default ListingPage;
