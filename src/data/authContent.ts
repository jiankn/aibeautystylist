import type { SupportedLocale } from "../lib/i18n";

export interface LoginContent {
  readonly title: string;
  readonly description: string;
  readonly posterAria: string;
  readonly posterKicker: string;
  readonly posterTitle: string;
  readonly posterBody: string;
  readonly proof: readonly string[];
  readonly eyebrow: string;
  readonly heading: string;
  readonly intro: string;
  readonly google: string;
  readonly emailDivider: string;
  readonly tabsLabel: string;
  readonly login: string;
  readonly register: string;
  readonly email: string;
  readonly password: string;
  readonly passwordHint: string;
  readonly forgot: string;
  readonly forgotHint: string;
  readonly sendReset: string;
  readonly back: string;
  readonly legalPrefix: string;
  readonly terms: string;
  readonly legalJoin: string;
  readonly privacy: string;
  readonly legalSuffix: string;
  readonly messages: {
    readonly connectingGoogle: string;
    readonly networkError: string;
    readonly signingIn: string;
    readonly signInSuccess: string;
    readonly signInFailed: string;
    readonly registering: string;
    readonly registerSuccess: string;
    readonly registerFailed: string;
    readonly sending: string;
    readonly resetFallback: string;
    readonly verifyInvalid: string;
    readonly oauthFailed: string;
    readonly oauthInvalid: string;
    readonly oauthUnavailable: string;
    readonly oauthCancelled: string;
    readonly oauthUnverified: string;
    readonly oauthConflict: string;
  };
}

export interface ResetPasswordContent {
  readonly title: string;
  readonly description: string;
  readonly heading: string;
  readonly password: string;
  readonly passwordHint: string;
  readonly submit: string;
  readonly back: string;
  readonly invalid: string;
  readonly saving: string;
  readonly success: string;
  readonly failed: string;
}

export interface AuthResponseMessages {
  readonly networkError: string;
  readonly invalidCredentials: string;
  readonly emailNotVerified: string;
  readonly oauthRequired: string;
  readonly authUnavailable: string;
  readonly rateLimited: string;
  readonly invalidEmail: string;
  readonly weakPassword: string;
  readonly emailInUse: string;
  readonly invalidToken: string;
  readonly registerSuccess: string;
  readonly registerSuccessEmailPending: string;
  readonly resetFallback: string;
}

interface AuthLocaleContent {
  readonly login: LoginContent;
  readonly reset: ResetPasswordContent;
}

function messages(values: {
  connecting: string;
  network: string;
  signing: string;
  signed: string;
  signFailed: string;
  registering: string;
  registered: string;
  registerFailed: string;
  sending: string;
  reset: string;
  invalid: string;
  oauthFailed: string;
  unavailable: string;
  cancelled: string;
  unverified: string;
  conflict: string;
}): LoginContent["messages"] {
  return {
    connectingGoogle: values.connecting,
    networkError: values.network,
    signingIn: values.signing,
    signInSuccess: values.signed,
    signInFailed: values.signFailed,
    registering: values.registering,
    registerSuccess: values.registered,
    registerFailed: values.registerFailed,
    sending: values.sending,
    resetFallback: values.reset,
    verifyInvalid: values.invalid,
    oauthFailed: values.oauthFailed,
    oauthInvalid: values.oauthFailed,
    oauthUnavailable: values.unavailable,
    oauthCancelled: values.cancelled,
    oauthUnverified: values.unverified,
    oauthConflict: values.conflict,
  };
}

const localized: Partial<Record<SupportedLocale, AuthLocaleContent>> = {
  "de-DE": {
    login: {
      title: "Loslegen | AI Beauty Stylist",
      description:
        "Anmelden oder Konto erstellen, um Looks, Diagnosen und Vorteile zu speichern.",
      posterAria: "Editoriales Make-up-Porträt",
      posterKicker: "Deine Beauty-Richtung",
      posterTitle: "Sieh den Look, bevor der Moment beginnt.",
      posterBody:
        "Entdecke Make-up-Richtungen passend zu Gesicht, Licht und Anlass.",
      proof: ["Persönliche Looks", "Datenschutz zuerst", "Später abrufbar"],
      eyebrow: "Ein Konto für alle Looks",
      heading: "Loslegen",
      intro:
        "Melde dich an oder erstelle ein Konto, um Looks, Diagnosen und Vorteile zu speichern.",
      google: "Mit Google fortfahren",
      emailDivider: "oder mit E-Mail fortfahren",
      tabsLabel: "Kontoaktionen",
      login: "Anmelden",
      register: "Konto erstellen",
      email: "E-Mail",
      password: "Passwort",
      passwordHint: "Mindestens 8 Zeichen mit Buchstaben und Zahlen",
      forgot: "Passwort vergessen",
      forgotHint:
        "Gib deine Konto-E-Mail ein. Wir senden einen Link zum Zurücksetzen.",
      sendReset: "Link senden",
      back: "Zurück zur Anmeldung",
      legalPrefix: "Mit dem Fortfahren stimmst du den ",
      terms: "Nutzungsbedingungen",
      legalJoin: " und der ",
      privacy: "Datenschutzerklärung",
      legalSuffix: " zu.",
      messages: messages({
        connecting: "Verbindung zu Google...",
        network: "Netzwerkfehler. Bitte erneut versuchen.",
        signing: "Anmeldung läuft...",
        signed: "Angemeldet. Weiterleitung...",
        signFailed: "Anmeldung fehlgeschlagen",
        registering: "Konto wird erstellt...",
        registered: "Konto erstellt. Bitte E-Mail bestätigen.",
        registerFailed: "Konto konnte nicht erstellt werden",
        sending: "Wird gesendet...",
        reset:
          "Falls die E-Mail registriert ist, wurde ein Link zum Zurücksetzen gesendet.",
        invalid: "Der Bestätigungslink ist ungültig oder abgelaufen.",
        oauthFailed: "Google-Anmeldung fehlgeschlagen. Bitte erneut versuchen.",
        unavailable: "Google-Anmeldung ist vorübergehend nicht verfügbar.",
        cancelled: "Google-Anmeldung wurde abgebrochen.",
        unverified: "Die Google-E-Mail ist nicht bestätigt.",
        conflict: "Dieses Google-Konto kann derzeit nicht verknüpft werden.",
      }),
    },
    reset: {
      title: "Passwort zurücksetzen | AI Beauty Stylist",
      description: "Lege ein neues Passwort für dein Konto fest.",
      heading: "Neues Passwort festlegen",
      password: "Neues Passwort",
      passwordHint: "Mindestens 8 Zeichen mit Buchstaben und Zahlen",
      submit: "Passwort speichern",
      back: "Zurück zur Anmeldung",
      invalid: "Der Link ist ungültig. Öffne den neuesten Link aus der E-Mail.",
      saving: "Wird gespeichert...",
      success: "Passwort aktualisiert. Weiterleitung...",
      failed: "Passwort konnte nicht zurückgesetzt werden",
    },
  },
  "fr-FR": {
    login: {
      title: "Commencer | AI Beauty Stylist",
      description:
        "Connectez-vous ou créez un compte pour enregistrer looks, diagnostics et avantages.",
      posterAria: "Portrait maquillage éditorial",
      posterKicker: "Votre beauté, votre direction",
      posterTitle: "Voyez le look avant que le moment commence.",
      posterBody:
        "Explorez des directions adaptées à vos traits, à la lumière et à l'occasion.",
      proof: [
        "Looks personnalisés",
        "Confidentialité intégrée",
        "À revoir plus tard",
      ],
      eyebrow: "Un compte pour tous vos looks",
      heading: "Commencer",
      intro:
        "Connectez-vous ou créez un compte pour enregistrer looks, diagnostics et avantages.",
      google: "Continuer avec Google",
      emailDivider: "ou continuer par e-mail",
      tabsLabel: "Actions du compte",
      login: "Se connecter",
      register: "Créer un compte",
      email: "E-mail",
      password: "Mot de passe",
      passwordHint: "Au moins 8 caractères avec lettres et chiffres",
      forgot: "Mot de passe oublié",
      forgotHint:
        "Saisissez l'e-mail du compte pour recevoir un lien de réinitialisation.",
      sendReset: "Envoyer le lien",
      back: "Retour à la connexion",
      legalPrefix: "En continuant, vous acceptez les ",
      terms: "Conditions d'utilisation",
      legalJoin: " et la ",
      privacy: "Politique de confidentialité",
      legalSuffix: ".",
      messages: messages({
        connecting: "Connexion à Google...",
        network: "Erreur réseau. Réessayez.",
        signing: "Connexion...",
        signed: "Connecté. Redirection...",
        signFailed: "Échec de la connexion",
        registering: "Création du compte...",
        registered: "Compte créé. Vérifiez votre e-mail.",
        registerFailed: "Échec de la création du compte",
        sending: "Envoi...",
        reset:
          "Si cet e-mail est enregistré, un lien de réinitialisation a été envoyé.",
        invalid: "Le lien de vérification est invalide ou expiré.",
        oauthFailed: "Échec de la connexion Google. Réessayez.",
        unavailable: "La connexion Google est temporairement indisponible.",
        cancelled: "La connexion Google a été annulée.",
        unverified: "L'e-mail de ce compte Google n'est pas vérifié.",
        conflict: "Ce compte Google ne peut pas être associé actuellement.",
      }),
    },
    reset: {
      title: "Réinitialiser le mot de passe | AI Beauty Stylist",
      description: "Définissez un nouveau mot de passe pour votre compte.",
      heading: "Définir un nouveau mot de passe",
      password: "Nouveau mot de passe",
      passwordHint: "Au moins 8 caractères avec lettres et chiffres",
      submit: "Enregistrer le mot de passe",
      back: "Retour à la connexion",
      invalid: "Le lien est invalide. Ouvrez le dernier lien reçu par e-mail.",
      saving: "Enregistrement...",
      success: "Mot de passe mis à jour. Redirection...",
      failed: "Échec de la réinitialisation",
    },
  },
  "ja-JP": {
    login: {
      title: "はじめる | AI Beauty Stylist",
      description:
        "ログインまたはアカウントを作成して、メイク、診断、会員特典を保存できます。",
      posterAria: "メイクアップポートレート",
      posterKicker: "自分らしい美しさへ",
      posterTitle: "その瞬間の前に、似合うメイクを確認。",
      posterBody: "顔立ち、光、シーンに合わせたメイク方向を探せます。",
      proof: ["自分向けのメイク", "プライバシー重視", "あとで見返せる"],
      eyebrow: "すべてのメイクを1つのアカウントで",
      heading: "はじめる",
      intro:
        "ログインまたはアカウントを作成して、メイク、診断、会員特典を保存できます。",
      google: "Googleで続ける",
      emailDivider: "またはメールアドレスで続ける",
      tabsLabel: "アカウント操作",
      login: "ログイン",
      register: "アカウント作成",
      email: "メールアドレス",
      password: "パスワード",
      passwordHint: "英字と数字を含む8文字以上",
      forgot: "パスワードを忘れた場合",
      forgotHint: "登録メールアドレスに再設定リンクを送信します。",
      sendReset: "再設定メールを送る",
      back: "ログインに戻る",
      legalPrefix: "続行すると、",
      terms: "利用規約",
      legalJoin: "および",
      privacy: "プライバシーポリシー",
      legalSuffix: "に同意したものとみなされます。",
      messages: messages({
        connecting: "Googleに接続中...",
        network: "ネットワークエラーです。もう一度お試しください。",
        signing: "ログイン中...",
        signed: "ログインしました。移動中...",
        signFailed: "ログインできませんでした",
        registering: "アカウント作成中...",
        registered: "アカウントを作成しました。メールをご確認ください。",
        registerFailed: "アカウントを作成できませんでした",
        sending: "送信中...",
        reset: "登録済みのメールアドレスの場合、再設定リンクを送信しました。",
        invalid: "確認リンクが無効または期限切れです。",
        oauthFailed: "Googleログインに失敗しました。もう一度お試しください。",
        unavailable: "Googleログインは一時的に利用できません。",
        cancelled: "Googleログインをキャンセルしました。",
        unverified: "Googleアカウントのメールが確認されていません。",
        conflict: "このGoogleアカウントは現在連携できません。",
      }),
    },
    reset: {
      title: "パスワード再設定 | AI Beauty Stylist",
      description: "アカウントの新しいパスワードを設定します。",
      heading: "新しいパスワードを設定",
      password: "新しいパスワード",
      passwordHint: "英字と数字を含む8文字以上",
      submit: "新しいパスワードを保存",
      back: "ログインに戻る",
      invalid: "リンクが無効です。最新のメールリンクを開いてください。",
      saving: "保存中...",
      success: "パスワードを更新しました。移動中...",
      failed: "パスワードを再設定できませんでした",
    },
  },
  "ko-KR": {
    login: {
      title: "시작하기 | AI Beauty Stylist",
      description:
        "로그인하거나 계정을 만들어 룩, 진단 및 멤버십 혜택을 저장하세요.",
      posterAria: "에디토리얼 메이크업 인물",
      posterKicker: "나만의 뷰티 방향",
      posterTitle: "중요한 순간 전에 어울리는 룩을 확인하세요.",
      posterBody: "얼굴 특징, 조명 및 상황에 맞춘 메이크업 방향을 탐색하세요.",
      proof: ["개인 맞춤 룩", "개인정보 우선", "언제든 다시 보기"],
      eyebrow: "모든 룩을 위한 하나의 계정",
      heading: "시작하기",
      intro: "로그인하거나 계정을 만들어 룩, 진단 및 멤버십 혜택을 저장하세요.",
      google: "Google로 계속",
      emailDivider: "또는 이메일로 계속",
      tabsLabel: "계정 작업",
      login: "로그인",
      register: "계정 만들기",
      email: "이메일",
      password: "비밀번호",
      passwordHint: "영문과 숫자를 포함해 8자 이상",
      forgot: "비밀번호 찾기",
      forgotHint: "계정 이메일로 재설정 링크를 보내 드립니다.",
      sendReset: "재설정 이메일 보내기",
      back: "로그인으로 돌아가기",
      legalPrefix: "계속하면 ",
      terms: "서비스 이용약관",
      legalJoin: " 및 ",
      privacy: "개인정보 처리방침",
      legalSuffix: "에 동의합니다.",
      messages: messages({
        connecting: "Google 연결 중...",
        network: "네트워크 오류입니다. 다시 시도하세요.",
        signing: "로그인 중...",
        signed: "로그인했습니다. 이동 중...",
        signFailed: "로그인 실패",
        registering: "계정 생성 중...",
        registered: "계정이 생성되었습니다. 이메일을 확인하세요.",
        registerFailed: "계정 생성 실패",
        sending: "전송 중...",
        reset: "등록된 이메일인 경우 재설정 링크를 보냈습니다.",
        invalid: "인증 링크가 유효하지 않거나 만료되었습니다.",
        oauthFailed: "Google 로그인에 실패했습니다. 다시 시도하세요.",
        unavailable: "Google 로그인을 일시적으로 사용할 수 없습니다.",
        cancelled: "Google 로그인이 취소되었습니다.",
        unverified: "Google 계정 이메일이 인증되지 않았습니다.",
        conflict: "현재 이 Google 계정을 연결할 수 없습니다.",
      }),
    },
    reset: {
      title: "비밀번호 재설정 | AI Beauty Stylist",
      description: "계정의 새 비밀번호를 설정하세요.",
      heading: "새 비밀번호 설정",
      password: "새 비밀번호",
      passwordHint: "영문과 숫자를 포함해 8자 이상",
      submit: "새 비밀번호 저장",
      back: "로그인으로 돌아가기",
      invalid: "링크가 유효하지 않습니다. 최신 이메일 링크를 여세요.",
      saving: "저장 중...",
      success: "비밀번호를 업데이트했습니다. 이동 중...",
      failed: "비밀번호 재설정 실패",
    },
  },
  "zh-TW": {
    login: {
      title: "開始使用 | AI Beauty Stylist",
      description:
        "登入或建立 AI Beauty Stylist 帳戶，儲存妝容、診斷與會員權益。",
      posterAria: "精緻妝容人物海報",
      posterKicker: "為你的美找到方向",
      posterTitle: "在重要時刻到來前，先看見理想妝容。",
      posterBody: "依照你的五官、光線與場合，探索適合的妝容方向。",
      proof: ["專屬妝容方向", "隱私優先", "隨時回看"],
      eyebrow: "一個帳戶管理所有妝容",
      heading: "開始使用",
      intro: "登入或建立帳戶，儲存妝容、診斷與會員權益。",
      google: "使用 Google 帳戶繼續",
      emailDivider: "或使用電子郵件",
      tabsLabel: "帳戶操作",
      login: "登入",
      register: "建立帳戶",
      email: "電子郵件",
      password: "密碼",
      passwordHint: "至少 8 個字元，包含英文字母與數字",
      forgot: "忘記密碼",
      forgotHint: "輸入註冊電子郵件，我們會寄送密碼重設連結。",
      sendReset: "寄送重設郵件",
      back: "返回登入",
      legalPrefix: "繼續即表示你同意",
      terms: "服務條款",
      legalJoin: "與",
      privacy: "隱私政策",
      legalSuffix: "。",
      messages: messages({
        connecting: "正在連接 Google...",
        network: "網路連線失敗，請重試。",
        signing: "登入中...",
        signed: "登入成功，正在跳轉...",
        signFailed: "登入失敗",
        registering: "正在建立帳戶...",
        registered: "帳戶已建立，請查收驗證郵件。",
        registerFailed: "帳戶建立失敗",
        sending: "寄送中...",
        reset: "若此電子郵件已註冊，我們已寄送密碼重設連結。",
        invalid: "驗證連結無效或已過期。",
        oauthFailed: "Google 登入失敗，請重試。",
        unavailable: "Google 登入暫時無法使用。",
        cancelled: "你已取消 Google 登入。",
        unverified: "此 Google 帳戶的電子郵件尚未驗證。",
        conflict: "目前無法連結此 Google 帳戶。",
      }),
    },
    reset: {
      title: "重設密碼 | AI Beauty Stylist",
      description: "設定新的 AI Beauty Stylist 帳戶密碼。",
      heading: "設定新密碼",
      password: "新密碼",
      passwordHint: "至少 8 個字元，包含英文字母與數字",
      submit: "儲存新密碼",
      back: "返回登入",
      invalid: "重設連結無效，請開啟最新的郵件連結。",
      saving: "儲存中...",
      success: "密碼已更新，正在跳轉...",
      failed: "密碼重設失敗",
    },
  },
  "es-ES": {
    login: {
      title: "Empezar | AI Beauty Stylist",
      description:
        "Inicia sesión o crea una cuenta para guardar looks, diagnósticos y ventajas.",
      posterAria: "Retrato editorial de maquillaje",
      posterKicker: "Tu belleza, con dirección",
      posterTitle: "Mira el look antes de que llegue el momento.",
      posterBody:
        "Explora direcciones adaptadas a tus rasgos, la luz y la ocasión.",
      proof: [
        "Looks personalizados",
        "Privacidad integrada",
        "Guardado para después",
      ],
      eyebrow: "Una cuenta para todos tus looks",
      heading: "Empezar",
      intro:
        "Inicia sesión o crea una cuenta para guardar looks, diagnósticos y ventajas.",
      google: "Continuar con Google",
      emailDivider: "o continuar con correo",
      tabsLabel: "Acciones de cuenta",
      login: "Iniciar sesión",
      register: "Crear cuenta",
      email: "Correo electrónico",
      password: "Contraseña",
      passwordHint: "Al menos 8 caracteres con letras y números",
      forgot: "Olvidé mi contraseña",
      forgotHint:
        "Introduce el correo de la cuenta y enviaremos un enlace de restablecimiento.",
      sendReset: "Enviar enlace",
      back: "Volver a iniciar sesión",
      legalPrefix: "Al continuar, aceptas los ",
      terms: "Términos del servicio",
      legalJoin: " y la ",
      privacy: "Política de privacidad",
      legalSuffix: ".",
      messages: messages({
        connecting: "Conectando con Google...",
        network: "Error de red. Inténtalo de nuevo.",
        signing: "Iniciando sesión...",
        signed: "Sesión iniciada. Redirigiendo...",
        signFailed: "No se pudo iniciar sesión",
        registering: "Creando cuenta...",
        registered: "Cuenta creada. Revisa tu correo.",
        registerFailed: "No se pudo crear la cuenta",
        sending: "Enviando...",
        reset:
          "Si el correo está registrado, hemos enviado un enlace de restablecimiento.",
        invalid: "El enlace de verificación no es válido o ha caducado.",
        oauthFailed: "Error al iniciar sesión con Google. Inténtalo de nuevo.",
        unavailable: "El inicio con Google no está disponible temporalmente.",
        cancelled: "Has cancelado el inicio con Google.",
        unverified: "El correo de esta cuenta Google no está verificado.",
        conflict: "Esta cuenta Google no se puede vincular ahora.",
      }),
    },
    reset: {
      title: "Restablecer contraseña | AI Beauty Stylist",
      description: "Define una nueva contraseña para tu cuenta.",
      heading: "Definir nueva contraseña",
      password: "Nueva contraseña",
      passwordHint: "Al menos 8 caracteres con letras y números",
      submit: "Guardar contraseña",
      back: "Volver a iniciar sesión",
      invalid: "El enlace no es válido. Abre el último enlace recibido.",
      saving: "Guardando...",
      success: "Contraseña actualizada. Redirigiendo...",
      failed: "No se pudo restablecer la contraseña",
    },
  },
  "pt-BR": {
    login: {
      title: "Começar | AI Beauty Stylist",
      description:
        "Entre ou crie uma conta para salvar looks, diagnósticos e benefícios.",
      posterAria: "Retrato editorial de maquiagem",
      posterKicker: "Sua beleza, com direção",
      posterTitle: "Veja o look antes do momento chegar.",
      posterBody:
        "Explore direções adaptadas aos seus traços, à luz e à ocasião.",
      proof: [
        "Looks personalizados",
        "Privacidade integrada",
        "Salvo para depois",
      ],
      eyebrow: "Uma conta para todos os looks",
      heading: "Começar",
      intro:
        "Entre ou crie uma conta para salvar looks, diagnósticos e benefícios.",
      google: "Continuar com Google",
      emailDivider: "ou continuar com e-mail",
      tabsLabel: "Ações da conta",
      login: "Entrar",
      register: "Criar conta",
      email: "E-mail",
      password: "Senha",
      passwordHint: "Pelo menos 8 caracteres com letras e números",
      forgot: "Esqueci a senha",
      forgotHint:
        "Informe o e-mail da conta e enviaremos um link de redefinição.",
      sendReset: "Enviar link",
      back: "Voltar para entrar",
      legalPrefix: "Ao continuar, você concorda com os ",
      terms: "Termos de serviço",
      legalJoin: " e a ",
      privacy: "Política de privacidade",
      legalSuffix: ".",
      messages: messages({
        connecting: "Conectando ao Google...",
        network: "Erro de rede. Tente novamente.",
        signing: "Entrando...",
        signed: "Login concluído. Redirecionando...",
        signFailed: "Não foi possível entrar",
        registering: "Criando conta...",
        registered: "Conta criada. Confira seu e-mail.",
        registerFailed: "Não foi possível criar a conta",
        sending: "Enviando...",
        reset:
          "Se o e-mail estiver cadastrado, enviamos um link de redefinição.",
        invalid: "O link de verificação é inválido ou expirou.",
        oauthFailed: "Falha no login com Google. Tente novamente.",
        unavailable: "O login com Google está temporariamente indisponível.",
        cancelled: "O login com Google foi cancelado.",
        unverified: "O e-mail desta conta Google não foi verificado.",
        conflict: "Esta conta Google não pode ser vinculada agora.",
      }),
    },
    reset: {
      title: "Redefinir senha | AI Beauty Stylist",
      description: "Defina uma nova senha para sua conta.",
      heading: "Definir nova senha",
      password: "Nova senha",
      passwordHint: "Pelo menos 8 caracteres com letras e números",
      submit: "Salvar senha",
      back: "Voltar para entrar",
      invalid: "O link é inválido. Abra o link mais recente do e-mail.",
      saving: "Salvando...",
      success: "Senha atualizada. Redirecionando...",
      failed: "Não foi possível redefinir a senha",
    },
  },
};

localized["es-419"] = localized["es-ES"];

const defaultAuthResponseMessages: AuthResponseMessages = {
  networkError:
    "Network connection failed. Check your connection and try again.",
  invalidCredentials: "Email or password is incorrect.",
  emailNotVerified: "Please verify your email before signing in.",
  oauthRequired: "This account can only sign in with Google.",
  authUnavailable:
    "Account service is temporarily unavailable. Try again later.",
  rateLimited: "Too many attempts. Please try again later.",
  invalidEmail: "Enter a valid email address.",
  weakPassword: "Use at least 8 characters with letters and numbers.",
  emailInUse:
    "This email is already registered. Sign in or reset your password.",
  invalidToken: "This reset link is invalid or expired.",
  registerSuccess: "Account created. Check your email to verify it.",
  registerSuccessEmailPending:
    "Account created, but the verification email could not be sent right now. Try again later.",
  resetFallback:
    "If this email is registered, we have sent a password reset link.",
};

const localizedAuthResponseMessages: Partial<
  Record<SupportedLocale, AuthResponseMessages>
> = {
  en: defaultAuthResponseMessages,
  "zh-CN": {
    networkError: "网络连接失败，请检查网络后重试。",
    invalidCredentials: "邮箱或密码不正确。",
    emailNotVerified: "请先完成邮箱验证后再登录。",
    oauthRequired: "该账号仅支持 Google 登录。",
    authUnavailable: "账户服务暂时不可用，请稍后再试。",
    rateLimited: "尝试次数过多，请稍后再试。",
    invalidEmail: "请输入有效的邮箱地址。",
    weakPassword: "密码至少 8 位，且包含字母和数字。",
    emailInUse: "该邮箱已注册，请直接登录或找回密码。",
    invalidToken: "重置链接无效或已过期。",
    registerSuccess: "注册成功，请查收验证邮件。",
    registerSuccessEmailPending:
      "注册成功，但验证邮件暂未发送，请稍后重试发送。",
    resetFallback: "如果该邮箱已注册，我们已发送密码重置邮件。",
  },
  "de-DE": {
    networkError:
      "Netzwerkfehler. Bitte Verbindung prüfen und erneut versuchen.",
    invalidCredentials: "E-Mail oder Passwort ist falsch.",
    emailNotVerified: "Bitte bestätige deine E-Mail vor der Anmeldung.",
    oauthRequired: "Dieses Konto kann nur mit Google angemeldet werden.",
    authUnavailable:
      "Der Kontodienst ist vorübergehend nicht verfügbar. Bitte später erneut versuchen.",
    rateLimited: "Zu viele Versuche. Bitte später erneut versuchen.",
    invalidEmail: "Gib eine gültige E-Mail-Adresse ein.",
    weakPassword: "Nutze mindestens 8 Zeichen mit Buchstaben und Zahlen.",
    emailInUse:
      "Diese E-Mail ist bereits registriert. Melde dich an oder setze das Passwort zurück.",
    invalidToken: "Dieser Link ist ungültig oder abgelaufen.",
    registerSuccess: "Konto erstellt. Bitte bestätige deine E-Mail.",
    registerSuccessEmailPending:
      "Konto erstellt, aber die Bestätigungs-E-Mail konnte gerade nicht gesendet werden. Bitte später erneut versuchen.",
    resetFallback:
      "Falls die E-Mail registriert ist, wurde ein Link zum Zurücksetzen gesendet.",
  },
  "fr-FR": {
    networkError: "Erreur réseau. Vérifiez votre connexion et réessayez.",
    invalidCredentials: "L'e-mail ou le mot de passe est incorrect.",
    emailNotVerified: "Veuillez vérifier votre e-mail avant de vous connecter.",
    oauthRequired: "Ce compte ne peut se connecter qu'avec Google.",
    authUnavailable:
      "Le service de compte est temporairement indisponible. Réessayez plus tard.",
    rateLimited: "Trop de tentatives. Réessayez plus tard.",
    invalidEmail: "Saisissez une adresse e-mail valide.",
    weakPassword:
      "Utilisez au moins 8 caractères avec des lettres et des chiffres.",
    emailInUse:
      "Cet e-mail est déjà inscrit. Connectez-vous ou réinitialisez le mot de passe.",
    invalidToken: "Ce lien de réinitialisation est invalide ou expiré.",
    registerSuccess: "Compte créé. Vérifiez votre e-mail.",
    registerSuccessEmailPending:
      "Compte créé, mais l'e-mail de vérification n'a pas pu être envoyé pour le moment. Réessayez plus tard.",
    resetFallback:
      "Si cet e-mail est enregistré, un lien de réinitialisation a été envoyé.",
  },
  "ja-JP": {
    networkError:
      "ネットワークエラーです。接続を確認してもう一度お試しください。",
    invalidCredentials: "メールアドレスまたはパスワードが正しくありません。",
    emailNotVerified: "ログインする前にメールアドレスを確認してください。",
    oauthRequired: "このアカウントは Google ログインのみ利用できます。",
    authUnavailable:
      "アカウントサービスは一時的に利用できません。時間をおいて再度お試しください。",
    rateLimited: "試行回数が多すぎます。時間をおいて再度お試しください。",
    invalidEmail: "有効なメールアドレスを入力してください。",
    weakPassword: "英字と数字を含む8文字以上のパスワードにしてください。",
    emailInUse:
      "このメールアドレスは登録済みです。ログインするか、パスワードを再設定してください。",
    invalidToken: "再設定リンクが無効または期限切れです。",
    registerSuccess: "アカウントを作成しました。メールをご確認ください。",
    registerSuccessEmailPending:
      "アカウントを作成しましたが、確認メールを現在送信できません。時間をおいて再度お試しください。",
    resetFallback:
      "登録済みのメールアドレスの場合、再設定リンクを送信しました。",
  },
  "ko-KR": {
    networkError: "네트워크 오류입니다. 연결을 확인한 뒤 다시 시도하세요.",
    invalidCredentials: "이메일 또는 비밀번호가 올바르지 않습니다.",
    emailNotVerified: "로그인하기 전에 이메일 인증을 완료하세요.",
    oauthRequired: "이 계정은 Google 로그인만 사용할 수 있습니다.",
    authUnavailable:
      "계정 서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도하세요.",
    rateLimited: "시도 횟수가 너무 많습니다. 잠시 후 다시 시도하세요.",
    invalidEmail: "유효한 이메일 주소를 입력하세요.",
    weakPassword: "영문과 숫자를 포함해 8자 이상으로 설정하세요.",
    emailInUse:
      "이미 등록된 이메일입니다. 로그인하거나 비밀번호를 재설정하세요.",
    invalidToken: "재설정 링크가 유효하지 않거나 만료되었습니다.",
    registerSuccess: "계정이 생성되었습니다. 이메일을 확인하세요.",
    registerSuccessEmailPending:
      "계정은 생성되었지만 지금은 인증 이메일을 보낼 수 없습니다. 잠시 후 다시 시도하세요.",
    resetFallback: "등록된 이메일인 경우 재설정 링크를 보냈습니다.",
  },
  "zh-TW": {
    networkError: "網路連線失敗，請檢查網路後重試。",
    invalidCredentials: "電子郵件或密碼不正確。",
    emailNotVerified: "請先完成電子郵件驗證後再登入。",
    oauthRequired: "此帳戶僅支援 Google 登入。",
    authUnavailable: "帳戶服務暫時無法使用，請稍後再試。",
    rateLimited: "嘗試次數過多，請稍後再試。",
    invalidEmail: "請輸入有效的電子郵件地址。",
    weakPassword: "密碼至少 8 個字元，且包含英文字母與數字。",
    emailInUse: "此電子郵件已註冊，請直接登入或重設密碼。",
    invalidToken: "重設連結無效或已過期。",
    registerSuccess: "帳戶已建立，請查收驗證郵件。",
    registerSuccessEmailPending:
      "帳戶已建立，但驗證郵件暫時無法寄送，請稍後再試。",
    resetFallback: "若此電子郵件已註冊，我們已寄送密碼重設連結。",
  },
  "es-ES": {
    networkError: "Error de red. Revisa tu conexión e inténtalo de nuevo.",
    invalidCredentials: "El correo o la contraseña no son correctos.",
    emailNotVerified: "Verifica tu correo electrónico antes de iniciar sesión.",
    oauthRequired: "Esta cuenta solo puede iniciar sesión con Google.",
    authUnavailable:
      "El servicio de cuenta no está disponible temporalmente. Inténtalo más tarde.",
    rateLimited: "Demasiados intentos. Inténtalo más tarde.",
    invalidEmail: "Introduce una dirección de correo válida.",
    weakPassword: "Usa al menos 8 caracteres con letras y números.",
    emailInUse:
      "Este correo ya está registrado. Inicia sesión o restablece la contraseña.",
    invalidToken: "Este enlace de restablecimiento no es válido o ha caducado.",
    registerSuccess: "Cuenta creada. Revisa tu correo.",
    registerSuccessEmailPending:
      "Cuenta creada, pero no se pudo enviar el correo de verificación ahora. Inténtalo más tarde.",
    resetFallback:
      "Si el correo está registrado, hemos enviado un enlace de restablecimiento.",
  },
  "pt-BR": {
    networkError: "Erro de rede. Verifique sua conexão e tente novamente.",
    invalidCredentials: "E-mail ou senha incorretos.",
    emailNotVerified: "Verifique seu e-mail antes de entrar.",
    oauthRequired: "Esta conta só pode entrar com Google.",
    authUnavailable:
      "O serviço de conta está temporariamente indisponível. Tente novamente mais tarde.",
    rateLimited: "Muitas tentativas. Tente novamente mais tarde.",
    invalidEmail: "Informe um endereço de e-mail válido.",
    weakPassword: "Use pelo menos 8 caracteres com letras e números.",
    emailInUse: "Este e-mail já está registrado. Entre ou redefina sua senha.",
    invalidToken: "Este link de redefinição é inválido ou expirou.",
    registerSuccess: "Conta criada. Confira seu e-mail.",
    registerSuccessEmailPending:
      "Conta criada, mas o e-mail de verificação não pôde ser enviado agora. Tente novamente mais tarde.",
    resetFallback:
      "Se o e-mail estiver cadastrado, enviamos um link de redefinição.",
  },
};

localizedAuthResponseMessages["es-419"] =
  localizedAuthResponseMessages["es-ES"];

export function getLocalizedLoginContent(
  locale: SupportedLocale,
): LoginContent | undefined {
  return localized[locale]?.login;
}

export function getLocalizedResetPasswordContent(
  locale: SupportedLocale,
): ResetPasswordContent | undefined {
  return localized[locale]?.reset;
}

export function getLocalizedAuthResponseMessages(
  locale: SupportedLocale,
): AuthResponseMessages {
  return localizedAuthResponseMessages[locale] ?? defaultAuthResponseMessages;
}
