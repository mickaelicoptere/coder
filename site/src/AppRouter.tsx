import { useSelector } from "@xstate/react"
import { FeatureNames } from "api/types"
import { RequirePermission } from "components/RequirePermission/RequirePermission"
import { SetupPage } from "pages/SetupPage/SetupPage"
import { TemplateSettingsPage } from "pages/TemplateSettingsPage/TemplateSettingsPage"
import { FC, lazy, Suspense, useContext } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { selectPermissions } from "xServices/auth/authSelectors"
import { selectFeatureVisibility } from "xServices/entitlements/entitlementsSelectors"
import { XServiceContext } from "xServices/StateContext"
import { AuthAndFrame } from "./components/AuthAndFrame/AuthAndFrame"
import { RequireAuth } from "./components/RequireAuth/RequireAuth"
import { SettingsLayout } from "./components/SettingsLayout/SettingsLayout"
import { IndexPage } from "./pages"
import { NotFoundPage } from "./pages/404Page/404Page"
import { CliAuthenticationPage } from "./pages/CliAuthPage/CliAuthPage"
import { HealthzPage } from "./pages/HealthzPage/HealthzPage"
import { LoginPage } from "./pages/LoginPage/LoginPage"
import { TemplatePage } from "./pages/TemplatePage/TemplatePage"
import TemplatesPage from "./pages/TemplatesPage/TemplatesPage"
import { AccountPage } from "./pages/UserSettingsPage/AccountPage/AccountPage"
import { SecurityPage } from "./pages/UserSettingsPage/SecurityPage/SecurityPage"
import { SSHKeysPage } from "./pages/UserSettingsPage/SSHKeysPage/SSHKeysPage"
import { CreateUserPage } from "./pages/UsersPage/CreateUserPage/CreateUserPage"
import { UsersPage } from "./pages/UsersPage/UsersPage"
import { WorkspaceBuildPage } from "./pages/WorkspaceBuildPage/WorkspaceBuildPage"
import { WorkspacePage } from "./pages/WorkspacePage/WorkspacePage"
import { WorkspaceSchedulePage } from "./pages/WorkspaceSchedulePage/WorkspaceSchedulePage"

const WorkspaceAppErrorPage = lazy(
  () => import("./pages/WorkspaceAppErrorPage/WorkspaceAppErrorPage"),
)
const TerminalPage = lazy(() => import("./pages/TerminalPage/TerminalPage"))
const WorkspacesPage = lazy(() => import("./pages/WorkspacesPage/WorkspacesPage"))
const CreateWorkspacePage = lazy(() => import("./pages/CreateWorkspacePage/CreateWorkspacePage"))
const AuditPage = lazy(() => import("./pages/AuditPage/AuditPage"))

export const AppRouter: FC = () => {
  const xServices = useContext(XServiceContext)
  const permissions = useSelector(xServices.authXService, selectPermissions)
  const featureVisibility = useSelector(xServices.entitlementsXService, selectFeatureVisibility)

  return (
    <Suspense fallback={<></>}>
      <Routes>
        <Route
          index
          element={
            <RequireAuth>
              <IndexPage />
            </RequireAuth>
          }
        />

        <Route path="login" element={<LoginPage />} />
        <Route path="setup" element={<SetupPage />} />
        <Route path="healthz" element={<HealthzPage />} />
        <Route
          path="cli-auth"
          element={
            <RequireAuth>
              <CliAuthenticationPage />
            </RequireAuth>
          }
        />

        <Route path="workspaces">
          <Route
            index
            element={
              <AuthAndFrame>
                <WorkspacesPage />
              </AuthAndFrame>
            }
          />
        </Route>

        <Route path="templates">
          <Route
            index
            element={
              <AuthAndFrame>
                <TemplatesPage />
              </AuthAndFrame>
            }
          />

          <Route path=":template">
            <Route
              index
              element={
                <AuthAndFrame>
                  <TemplatePage />
                </AuthAndFrame>
              }
            />
            <Route
              path="workspace"
              element={
                <RequireAuth>
                  <CreateWorkspacePage />
                </RequireAuth>
              }
            />
            <Route
              path="settings"
              element={
                <RequireAuth>
                  <TemplateSettingsPage />
                </RequireAuth>
              }
            />
          </Route>
        </Route>

        <Route path="users">
          <Route
            index
            element={
              <AuthAndFrame>
                <UsersPage />
              </AuthAndFrame>
            }
          />
          <Route
            path="create"
            element={
              <RequireAuth>
                <CreateUserPage />
              </RequireAuth>
            }
          />
        </Route>

        {/* REMARK: Route under construction
        Eventually, we should gate this page
        with permissions and licensing */}
        <Route path="/audit">
          <Route
            index
            element={
              process.env.NODE_ENV === "production" ? (
                <Navigate to="/workspaces" />
              ) : (
                <AuthAndFrame>
                  <RequirePermission
                    isFeatureVisible={
                      featureVisibility[FeatureNames.AuditLog] && !!permissions?.viewAuditLog
                    }
                  >
                    <AuditPage />
                  </RequirePermission>
                </AuthAndFrame>
              )
            }
          ></Route>
        </Route>

        <Route path="settings" element={<SettingsLayout />}>
          <Route path="account" element={<AccountPage />} />
          <Route path="security" element={<SecurityPage />} />
          <Route path="ssh-keys" element={<SSHKeysPage />} />
        </Route>

        <Route path="/@:username">
          <Route path=":workspace">
            <Route
              index
              element={
                <AuthAndFrame>
                  <WorkspacePage />
                </AuthAndFrame>
              }
            />
            <Route
              path="schedule"
              element={
                <RequireAuth>
                  <WorkspaceSchedulePage />
                </RequireAuth>
              }
            />

            <Route
              path="terminal"
              element={
                <RequireAuth>
                  <TerminalPage />
                </RequireAuth>
              }
            />

            <Route path="apps">
              <Route
                path=":app/*"
                element={
                  <AuthAndFrame>
                    <WorkspaceAppErrorPage />
                  </AuthAndFrame>
                }
              />
            </Route>

            <Route
              path="builds/:buildNumber"
              element={
                <AuthAndFrame>
                  <WorkspaceBuildPage />
                </AuthAndFrame>
              }
            />
          </Route>
        </Route>

        {/* Using path="*"" means "match anything", so this route
        acts like a catch-all for URLs that we don't have explicit
        routes for. */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
