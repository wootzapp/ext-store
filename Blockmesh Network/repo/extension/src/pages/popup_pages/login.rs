use crate::components::logo::Logo;
use crate::utils::auth::login;
use crate::utils::extension_wrapper_state::ExtensionWrapperState;
use block_mesh_common::chrome_storage::AuthStatus;
use block_mesh_common::interfaces::server_api::LoginForm;
use leptos::logging::log;
use leptos::*;
use uuid::Uuid;

#[component]
pub fn ExtensionLogin() -> impl IntoView {
    let state = use_context::<ExtensionWrapperState>().unwrap();
    let (password, set_password) = create_signal(String::new());
    let (email, set_email) = create_signal(String::new());
    let (wait, set_wait) = create_signal(false);

    let submit_action_resource = create_local_resource(
        move || (),
        move |_| async move {
            if wait.get_untracked()
                || email.get_untracked().is_empty()
                || password.get_untracked().is_empty()
            {
                return;
            }
            set_wait.set(true);
            let credentials = LoginForm {
                email: email.get_untracked(),
                password: password.get_untracked(),
            };

            let result = login(&state.blockmesh_url.get_untracked(), &credentials).await;
            match result {
                Ok(res) => {
                    if res.message.is_some() {
                        state.set_error(res.message.unwrap());
                        set_wait.set(false);
                        return;
                    }
                    if let Some(api_token) = res.api_token {
                        if api_token != state.api_token.get_untracked()
                            || state.api_token.get_untracked() == Uuid::default()
                        {
                            log!("Store new api token");
                            state.api_token.update(|v| *v = api_token);
                            state.email.update(|e| *e = credentials.email.clone());
                            ExtensionWrapperState::store_email(credentials.email.clone()).await;
                            ExtensionWrapperState::store_api_token(api_token).await;
                        }
                        state.set_success("Successfully logged in");
                        state.status.update(|v| *v = AuthStatus::LoggedIn);
                    }
                }
                Err(_) => {
                    state.set_error("Failed to login, please check your credentials again or reset password https://app.blockmesh.xyz/reset_password".to_string());
                }
            }
            set_wait.set(false);
        },
    );

    view! {
        <div class="auth-card">
            <img
                class="background-image"
                src="https://r2-images.blockmesh.xyz/2f6630f8-f48a-47ed-753b-4445c9399e00.png"
                alt="background"
            />
            <div class="auth-card-top"></div>
            <div class="auth-card-body">
                <Logo/>
                <form on:submit=|ev| ev.prevent_default()>
                    <div class="auth-card-input-container">
                        <input
                            type="text"
                            required=""
                            name="email"

                            on:keyup=move |ev: ev::KeyboardEvent| {
                                let val = event_target_value(&ev);
                                set_email.update(|v| *v = val.to_ascii_lowercase());
                            }

                            on:change=move |ev| {
                                let val = event_target_value(&ev);
                                set_email.update(|v| *v = val.to_ascii_lowercase());
                            }
                        />

                        <label class="font-bebas-neue text-off-white">Email</label>
                    </div>
                    <div class="auth-card-input-container">
                        <input
                            type="password"
                            required=""

                            name="password"
                            on:keyup=move |ev: ev::KeyboardEvent| {
                                match &*ev.key() {
                                    "Enter" => {
                                        submit_action_resource.refetch();
                                    }
                                    _ => {
                                        let val = event_target_value(&ev);
                                        set_password.update(|p| *p = val);
                                    }
                                }
                            }

                            on:change=move |ev| {
                                let val = event_target_value(&ev);
                                set_password.update(|p| *p = val);
                            }
                        />

                        <label class="font-bebas-neue text-off-white">Password</label>
                    </div>
                    <br/>
                    <button
                        class="auth-card-button font-bebas-neue text-off-white"
                        on:click=move |_ev| {
                            submit_action_resource.refetch();
                        }
                    >

                        Login
                    </button>
                </form>
            </div>
            <div class="auth-card-bottom">
                <small class="font-open-sans text-orange">Doesnt have an account yet?</small>
                <br/>
                <button on:click=move |_| { state.status.update(|v| *v = AuthStatus::Registering) }>
                    <small
                        class="text-magenta underline cursor-pointer"
                        on:click=move |_| { state.status.update(|v| *v = AuthStatus::Registering) }
                    >
                        Register here
                    </small>
                </button>
                <br/>
                <a href="https://app.blockmesh.xyz/register" rel="external">
                    <small class="text-magenta underline cursor-pointer">Register via app</small>
                </a>
            </div>
        </div>
    }
}
