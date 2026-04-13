import User, { UserInterface } from "../../models/User";

export const createUser = async (googleId?: string, displayName?: string): Promise<UserInterface> => {
    const user = User.build({
        googleId: googleId ?? "test-google-id",
        displayName: displayName ?? "Thomas Tester"
    });

    await user.save();
    
    return user;
};