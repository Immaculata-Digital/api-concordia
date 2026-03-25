export interface LandingPageHero {
    title?: string;
    sub_heading?: string;
    background_image?: string;
}

export interface LandingPageImages {
    text_content?: string;
    images?: string[];
}

export interface LandingPageGridContent {
    image_1?: string;
    text_2?: string;
    image_3?: string;
    text_4?: string;
    image_5?: string;
    text_6?: string;
}

export interface LandingPageAbout {
    title?: string;
    content?: string;
    image?: string;
}

export interface LandingPageVideo {
    video_placeholder?: string;
    video_url?: string;
}

export interface LandingPageProducts {
    title?: string;
}

export interface LandingPageContact {
    title?: string;
    content?: string;
}

export interface LandingPageGallery {
    image_position_1?: string;
    image_position_2?: string;
    image_position_3?: string;
}

export interface LandingPageStoreMap {
    title?: string;
    content?: string;
}

export interface LandingPageFeedbackItem {
    title?: string;
    quote?: string;
    author?: string;
    image?: string;
}

export interface LandingPageFooter {
    contact_info: {
        cnpj?: string;
        address?: string;
        whatsapp?: {
            label: string;
            slug: string;
        };
        instagram?: string;
    }
}

export interface LandingPageContent {
    "section-hero"?: LandingPageHero;
    "section-images"?: LandingPageImages;
    "section-grid-content"?: LandingPageGridContent;
    "section-about"?: LandingPageAbout;
    "section-video"?: LandingPageVideo;
    "section-products"?: LandingPageProducts;
    "section-contact"?: LandingPageContact;
    "section-gallery"?: LandingPageGallery;
    "section-store-map"?: LandingPageStoreMap;
    "section-feedback"?: {
        title: string;
        feedbacks: LandingPageFeedbackItem;
    };
    "section-footer"?: LandingPageFooter;
}

export interface LandingPage {
    uuid?: string;
    seqId?: number;
    tenantId: string;
    titulo: string;
    slug: string;
    content: LandingPageContent;
    ativa: boolean;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
